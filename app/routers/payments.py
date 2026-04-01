from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import secrets
import json
import httpx
from datetime import datetime, timedelta
import base64

from ..database import get_db
from ..models import User, PaymentOrder, CreditTransaction, Subscription
from ..schemas import (
    PaymentOrderCreate, PaymentOrderResponse,
    PayPalOrderResponse, AlipayQrResponse
)

router = APIRouter(prefix="/api/payment", tags=["支付"])

# 配置
PAYPAL_CLIENT_ID = "AQkquBDf1zctJOWGKWUEtKXm6qVfqUE7t8zDvWvJzrKj8Jvz8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z"  # 测试环境
PAYPAL_CLIENT_SECRET = "EHbZ9vP8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8"  # 测试环境
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"  # 生产环境：https://api-m.paypal.com

ALIPY_APP_ID = "9021000131658669"  # 替换为你的支付宝 APP_ID
ALIPY_PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA... 替换为你的私钥 ...
-----END RSA PRIVATE KEY-----"""
ALIPY_ALIPAY_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA... 替换为支付宝公钥 ...
-----END PUBLIC KEY-----"""
ALIPY_GATEWAY = "https://openapi.alipay.com/gateway.do"

# 产品定价配置（单位：分）
PRODUCTS = {
    "pro_monthly": {"amount": 1900, "currency": "USD", "credits": 150, "months": 1, "name": "Pro 月度"},
    "pro_annual": {"amount": 19900, "currency": "USD", "credits": 150, "months": 12, "name": "Pro 年度"},
    "credits_100": {"amount": 999, "currency": "USD", "credits": 100, "months": 0, "name": "100 Credits"},
    "credits_500": {"amount": 3999, "currency": "USD", "credits": 500, "months": 0, "name": "500 Credits"},
}

# 依赖项：获取当前登录用户
def get_current_user(authorization: str = Depends(lambda x: x), db: Session = Depends(get_db)):
    from ..routers.users import get_current_user as auth_get_user
    return auth_get_user(authorization, db)

# ==================== 创建订单 ====================

@router.post("/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(
    order: PaymentOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建支付订单"""
    if order.product_id not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid product")
    
    product = PRODUCTS[order.product_id]
    
    if order.payment_method not in ["paypal", "alipay"]:
        raise HTTPException(status_code=400, detail="Unsupported payment method")
    
    # 生成订单号
    order_no = f"ORD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{secrets.token_hex(4)}"
    
    # 创建订单记录
    payment_order = PaymentOrder(
        user_id=current_user.id,
        order_no=order_no,
        product_type=order.product_type,
        product_id=order.product_id,
        amount=product["amount"],
        currency=product["currency"],
        payment_method=order.payment_method,
        credits_amount=product["credits"],
        subscription_months=product["months"]
    )
    db.add(payment_order)
    db.commit()
    db.refresh(payment_order)
    
    # 根据支付方式创建支付
    if order.payment_method == "paypal":
        paypal_data = await create_paypal_order(payment_order, product)
        payment_order.paypal_order_id = paypal_data["order_id"]
        db.commit()
        return PaymentOrderResponse(
            **payment_order.__dict__,
            paypal_order_id=paypal_data["order_id"],
            alipay_url=paypal_data.get("approve_url")
        )
    else:  # alipay
        alipay_data = await create_alipay_order(payment_order, product, current_user)
        payment_order.alipay_out_trade_no = alipay_data["out_trade_no"]
        db.commit()
        return PaymentOrderResponse(
            **payment_order.__dict__,
            alipay_url=alipay_data.get("qr_code")
        )

# ==================== PayPal 支付 ====================

async def create_paypal_order(payment_order: PaymentOrder, product: dict) -> dict:
    """创建 PayPal 订单"""
    auth = base64.b64encode(f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}".encode()).decode()
    
    order_data = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "reference_id": payment_order.order_no,
            "amount": {
                "currency_code": product["currency"],
                "value": str(product["amount"] / 100)
            },
            "description": product["name"]
        }]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Basic {auth}"
            },
            json=order_data
        )
        
        if response.status_code != 201:
            raise HTTPException(status_code=500, detail="Failed to create PayPal order")
        
        data = response.json()
        approve_url = None
        for link in data.get("links", []):
            if link.get("rel") == "approve":
                approve_url = link.get("href")
                break
        
        return {
            "order_id": data["id"],
            "approve_url": approve_url,
            "status": data["status"]
        }

@router.post("/paypal/capture")
async def capture_paypal_order(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """确认 PayPal 支付"""
    data = await request.json()
    order_id = data.get("orderID")
    
    if not order_id:
        raise HTTPException(status_code=400, detail="Missing orderID")
    
    # 查找订单
    payment_order = db.query(PaymentOrder).filter(
        PaymentOrder.paypal_order_id == order_id,
        PaymentOrder.user_id == current_user.id
    ).first()
    
    if not payment_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if payment_order.status == "paid":
        return {"success": True, "message": "Already paid"}
    
    # 调用 PayPal API 确认支付
    auth = base64.b64encode(f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}".encode()).decode()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Basic {auth}"
            }
        )
        
        if response.status_code != 201:
            payment_order.status = "failed"
            db.commit()
            raise HTTPException(status_code=500, detail="Payment capture failed")
        
        capture_data = response.json()
        
        # 更新订单状态
        payment_order.status = "paid"
        payment_order.paid_at = datetime.utcnow()
        payment_order.paypal_order_id = capture_data["id"]
        
        # 发放 credits 或订阅
        await fulfill_order(payment_order, current_user, db)
        
        db.commit()
        
        return {"success": True, "credits": current_user.credits}

# ==================== 支付宝支付 ====================

async def create_alipay_order(payment_order: PaymentOrder, product: dict, user: User) -> dict:
    """创建支付宝订单（当面付二维码）"""
    import hashlib
    from Crypto.Signature import PKCS1_v1_5
    from Crypto.Hash import SHA256
    
    out_trade_no = payment_order.order_no
    total_amount = str(product["amount"] / 100)
    
    # 构建请求参数
    biz_content = {
        "out_trade_no": out_trade_no,
        "total_amount": total_amount,
        "subject": f"AI Poster Studio - {product['name']}",
        "product_code": "FACE_TO_FACE_PAYMENT",
        "qr_code_timeout_express": "30m"
    }
    
    params = {
        "app_id": ALIPY_APP_ID,
        "method": "alipay.trade.precreate",
        "charset": "utf-8",
        "sign_type": "RSA2",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "version": "1.0",
        "biz_content": json.dumps(biz_content, ensure_ascii=False)
    }
    
    # 生成签名（简化版本，实际需要使用完整的 RSA 签名）
    # 这里使用模拟数据，实际部署需要完整实现
    params["sign"] = "mock_signature"
    
    # 调用支付宝 API（简化版本）
    # 实际部署需要使用完整的 SDK
    
    return {
        "qr_code": f"https://qr.alipay.com/{out_trade_no}",  # 模拟二维码 URL
        "out_trade_no": out_trade_no,
        "total_amount": total_amount
    }

@router.post("/alipay/notify")
async def alipay_notify(request: Request, db: Session = Depends(get_db)):
    """支付宝异步通知回调"""
    data = await request.form()
    
    # 验证签名
    # 处理支付结果
    out_trade_no = data.get("out_trade_no")
    trade_status = data.get("trade_status")
    
    if trade_status == "TRADE_SUCCESS":
        payment_order = db.query(PaymentOrder).filter(
            PaymentOrder.alipay_out_trade_no == out_trade_no
        ).first()
        
        if payment_order and payment_order.status != "paid":
            user = db.query(User).filter(User.id == payment_order.user_id).first()
            payment_order.status = "paid"
            payment_order.paid_at = datetime.utcnow()
            payment_order.alipay_trade_no = data.get("trade_no")
            
            await fulfill_order(payment_order, user, db)
            db.commit()
    
    return "success"

# ==================== 订单履约 ====================

async def fulfill_order(payment_order: PaymentOrder, user: User, db: Session):
    """履行订单：发放 credits 或订阅"""
    # 发放 credits
    if payment_order.credits_amount > 0:
        user.credits += payment_order.credits_amount
        
        txn = CreditTransaction(
            user_id=user.id,
            amount=payment_order.credits_amount,
            type="purchase",
            description=f"购买 {payment_order.product_id}"
        )
        db.add(txn)
    
    # 激活订阅
    if payment_order.subscription_months > 0:
        # 取消旧订阅
        db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).update({"status": "expired"})
        
        # 创建新订阅
        subscription = Subscription(
            user_id=user.id,
            plan_type="pro",
            status="active",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30 * payment_order.subscription_months)
        )
        db.add(subscription)
        user.plan = "pro"

# ==================== 查询订单状态 ====================

@router.get("/order/{order_no}", response_model=PaymentOrderResponse)
async def get_order_status(
    order_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """查询订单状态"""
    payment_order = db.query(PaymentOrder).filter(
        PaymentOrder.order_no == order_no,
        PaymentOrder.user_id == current_user.id
    ).first()
    
    if not payment_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return payment_order

@router.get("/orders", response_model=list)
async def get_user_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户订单列表"""
    orders = db.query(PaymentOrder).filter(
        PaymentOrder.user_id == current_user.id
    ).order_by(PaymentOrder.created_at.desc()).offset(skip).limit(limit).all()
    
    return orders
