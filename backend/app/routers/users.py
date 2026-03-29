from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional
import secrets
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, Session as UserSession, Poster, Subscription, CreditTransaction, UserSettings
from ..schemas import (
    UserResponse, UserStats, UserProfileUpdate,
    PosterResponse, PosterCreate, PosterUpdate,
    CreditTransactionResponse, SubscriptionResponse, SubscriptionUpgrade
)

router = APIRouter(prefix="/api/user", tags=["用户中心"])

# 依赖项：获取当前登录用户
def get_current_user(authorization: str = Depends(lambda x: x), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    token = authorization.replace("Bearer ", "")
    session = db.query(UserSession).filter(
        UserSession.access_token == token,
        UserSession.expires_at > func.now()
    ).first()
    if not session:
        raise HTTPException(status_code=401, detail="Token expired")
    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ==================== 用户资料 ====================

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """获取用户资料"""
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户资料"""
    if profile.name is not None:
        current_user.name = profile.name
    if profile.email is not None:
        current_user.email = profile.email
    if profile.avatar_url is not None:
        current_user.avatar_url = profile.avatar_url
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户统计"""
    total_posters = db.query(Poster).filter(Poster.user_id == current_user.id).count()
    total_credits_used = db.query(func.sum(CreditTransaction.amount)).filter(
        CreditTransaction.user_id == current_user.id,
        CreditTransaction.type == "consumption"
    ).scalar() or 0
    
    return UserStats(
        total_posters=total_posters,
        total_credits_used=total_credits_used,
        last_login_at=current_user.last_login_at
    )

# ==================== 海报管理 ====================

@router.get("/posters", response_model=List[PosterResponse])
async def get_my_posters(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取我的海报列表"""
    posters = db.query(Poster).filter(
        Poster.user_id == current_user.id
    ).order_by(Poster.created_at.desc()).offset(skip).limit(limit).all()
    return posters

@router.get("/posters/{poster_id}", response_model=PosterResponse)
async def get_poster(
    poster_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取海报详情"""
    poster = db.query(Poster).filter(
        Poster.id == poster_id,
        Poster.user_id == current_user.id
    ).first()
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    return poster

@router.delete("/posters/{poster_id}")
async def delete_poster(
    poster_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除海报"""
    poster = db.query(Poster).filter(
        Poster.id == poster_id,
        Poster.user_id == current_user.id
    ).first()
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    db.delete(poster)
    db.commit()
    return {"success": True, "message": "Poster deleted"}

@router.put("/posters/{poster_id}", response_model=PosterResponse)
async def update_poster(
    poster_id: str,
    update: PosterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新海报信息"""
    poster = db.query(Poster).filter(
        Poster.id == poster_id,
        Poster.user_id == current_user.id
    ).first()
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    if update.title is not None:
        poster.title = update.title
    if update.prompt is not None:
        poster.prompt = update.prompt
    
    db.commit()
    db.refresh(poster)
    return poster

# ==================== 积分管理 ====================

@router.get("/credits")
async def get_credits(
    current_user: User = Depends(get_current_user)
):
    """获取积分余额"""
    return {
        "credits": current_user.credits,
        "plan": current_user.plan
    }

@router.get("/transactions", response_model=List[CreditTransactionResponse])
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取积分流水"""
    query = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == current_user.id
    )
    
    if type:
        query = query.filter(CreditTransaction.type == type)
    
    transactions = query.order_by(
        CreditTransaction.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return transactions

@router.post("/credits/add")
async def add_credits(
    amount: int,
    type: str,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """添加积分（内部使用）"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # 增加用户积分
    current_user.credits += amount
    
    # 创建流水记录
    txn = CreditTransaction(
        user_id=current_user.id,
        amount=amount,
        type=type,  # purchase/bonus/refund
        description=description
    )
    db.add(txn)
    db.commit()
    
    return {"success": True, "credits": current_user.credits}

@router.post("/credits/consume")
async def consume_credits(
    amount: int,
    description: Optional[str] = None,
    poster_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """消耗积分（内部使用）"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    if current_user.credits < amount:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    # 扣除用户积分
    current_user.credits -= amount
    
    # 创建流水记录
    txn = CreditTransaction(
        user_id=current_user.id,
        amount=-amount,  # 负数表示消耗
        type="consumption",
        description=description,
        poster_id=poster_id
    )
    db.add(txn)
    db.commit()
    
    return {"success": True, "credits": current_user.credits}

# ==================== 订阅管理 ====================

@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取订阅状态"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        # 返回默认的免费计划
        return SubscriptionResponse(
            id="free",
            plan_type="free",
            status="active",
            start_date=current_user.created_at,
            end_date=None
        )
    
    return subscription

@router.post("/subscription/upgrade")
async def upgrade_subscription(
    upgrade: SubscriptionUpgrade,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """升级订阅计划"""
    # TODO: 集成支付系统
    # 这里只是示例，实际应该调用 Stripe 或其他支付 API
    
    if upgrade.plan_type not in ["pro", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    # 创建订阅记录
    subscription = Subscription(
        user_id=current_user.id,
        plan_type=upgrade.plan_type,
        status="active",
        end_date=datetime.utcnow() + timedelta(days=30)  # 30 天订阅
    )
    db.add(subscription)
    
    # 更新用户计划
    current_user.plan = upgrade.plan_type
    
    # 赠送积分
    bonus_credits = 100 if upgrade.plan_type == "pro" else 500
    current_user.credits += bonus_credits
    
    # 创建积分流水
    txn = CreditTransaction(
        user_id=current_user.id,
        amount=bonus_credits,
        type="bonus",
        description=f"Subscription upgrade to {upgrade.plan_type}"
    )
    db.add(txn)
    
    db.commit()
    
    return {
        "success": True,
        "subscription": subscription,
        "bonus_credits": bonus_credits
    }

# ==================== 用户设置 ====================

@router.get("/settings")
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户设置"""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        # 返回默认设置
        return {
            "language": "zh-CN",
            "theme": "light",
            "email_notifications": True
        }
    
    return settings

@router.put("/settings")
async def update_settings(
    settings: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户设置"""
    user_settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()
    
    if not user_settings:
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)
    
    if "language" in settings:
        user_settings.language = settings["language"]
    if "theme" in settings:
        user_settings.theme = settings["theme"]
    if "email_notifications" in settings:
        user_settings.email_notifications = settings["email_notifications"]
    
    db.commit()
    db.refresh(user_settings)
    
    return user_settings
