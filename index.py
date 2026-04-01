"""
Vercel Python Serverless Function using FastAPI
"""
import sys
import os
import secrets
import traceback
import base64
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# 项目根目录已在 Python 路径中

app = FastAPI()

# 添加 CORS 中间件 - 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-poster-studio.vercel.app",
        "https://ai-poster-studio-backend.vercel.app",
        "http://localhost:3000",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "healthy", "path": os.path.abspath(__file__)}

@app.get("/api/auth/google/url")
async def get_google_auth_url():
    """Get Google OAuth authorization URL"""
    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "https://ai-poster-studio-b711.vercel.app/api/auth/callback")
        state = secrets.token_urlsafe(32)
        
        if not client_id:
            raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
        
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=openid%20email%20profile&state={state}&access_type=offline&prompt=consent"
        
        return JSONResponse(
            content={"authorization_url": auth_url, "state": state},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error: {error_trace}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"{str(e)}")

@app.get("/api/auth/callback")
async def google_callback(request: Request):
    """Handle Google OAuth callback"""
    try:
        query_params = dict(request.query_params)
        code = query_params.get('code', '')
        
        if not code:
            return RedirectResponse(url="https://ai-poster-studio.vercel.app/login?error=no_code")
        
        # 延迟导入数据库模块
        try:
            from app.database import get_db
            from app.models import User, Session as UserSession, OAuthAccount
        except ImportError as e:
            print(f"Import error: {e}", file=sys.stderr)
            return RedirectResponse(url=f"https://ai-poster-studio.vercel.app/login?error=import_error&detail={str(e)}")
        
        from datetime import datetime, timedelta
        import httpx
        
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "https://ai-poster-studio-b711.vercel.app/api/auth/callback")
        
        # 换取 token
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": redirect_uri
                }
            )
            token_data = token_resp.json()
            
            if "error" in token_data:
                print(f"Token error: {token_data}", file=sys.stderr)
                return RedirectResponse(url="https://ai-poster-studio.vercel.app/login?error=token_error")
            
            access_token = token_data.get("access_token")
        
        # 获取用户信息
        async with httpx.AsyncClient() as client:
            user_resp = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            google_user = user_resp.json()
        
        google_id = google_user.get("id")
        email = google_user.get("email")
        name = google_user.get("name")
        avatar_url = google_user.get("picture")
        
        # 查找或创建用户
        db = next(get_db())
        try:
            oauth = db.query(OAuthAccount).filter(OAuthAccount.provider_account_id == google_id).first()
            if oauth:
                user = db.query(User).filter(User.id == oauth.user_id).first()
                oauth.access_token = access_token
            else:
                user_id = f"user_{secrets.token_hex(16)}"
                user = User(id=user_id, email=email, name=name, avatar_url=avatar_url, google_id=google_id, credits=5, plan="free")
                db.add(user)
                db.flush()
                oauth_id = f"oauth_{secrets.token_hex(16)}"
                oauth = OAuthAccount(id=oauth_id, user_id=user.id, provider="google", provider_account_id=google_id, access_token=access_token)
                db.add(oauth)
            
            # 创建会话
            session_token = secrets.token_urlsafe(16)  # 缩短 token 长度，避免 URL 过长
            expires_at = datetime.utcnow() + timedelta(days=30)
            session_id = f"session_{secrets.token_hex(16)}"
            app_session = UserSession(
                id=session_id,
                user_id=user.id,
                access_token=session_token,
                refresh_token=secrets.token_urlsafe(16),
                expires_at=expires_at
            )
            db.add(app_session)
            db.commit()
            
            # 使用 URL 编码确保 token 正确传递
            import urllib.parse
            redirect_url = f"https://ai-poster-studio.vercel.app/login?token={urllib.parse.quote(session_token, safe='')}"
            print(f"[Google OAuth] Redirect URL: {redirect_url}", file=sys.stderr)
        finally:
            db.close()
        
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"[Google OAuth] ERROR: {e}", file=sys.stderr)
        print(f"[Google OAuth] Stack: {error_trace}", file=sys.stderr)
        return RedirectResponse(url=f"https://ai-poster-studio.vercel.app/login?error=auth_failed")

@app.get("/api/auth/me")
async def get_current_user(request: Request):
    """Get current user info"""
    authorization = request.headers.get("authorization")
    return await get_current_user_impl(authorization)

@app.post("/api/auth/logout")
async def logout(authorization: str = None):
    """Logout user"""
    if authorization and authorization.startswith("Bearer "):
        try:
            from app.database import get_db
        except ImportError:
            raise HTTPException(status_code=500, detail="Database import failed")
        
        token = authorization.replace("Bearer ", "")
        db = next(get_db())
        try:
            db.query(UserSession).filter(UserSession.access_token == token).delete()
            db.commit()
        finally:
            db.close()
    return {"success": True}

# 兼容旧版前端的 API 端点
@app.get("/api/user/profile")
async def get_user_profile(request: Request):
    """Get user profile (alias for /api/auth/me)"""
    authorization = request.headers.get("authorization")
    return await get_current_user_impl(authorization)

@app.get("/api/user/stats")
async def get_user_stats(request: Request):
    """Get user stats"""
    return {
        "total_posters": 0,
        "total_credits_used": 0,
        "last_login_at": None
    }

# ==================== Payment APIs ====================

@app.post("/api/payment/create-order")
async def create_payment_order_api(request: Request):
    """Create payment order"""
    print(f"[Payment API] Received create-order request", file=sys.stderr)
    try:
        from app.database import get_db
        from app.models import User, Session as UserSession, PaymentOrder
    except ImportError as e:
        print(f"[Payment API] Import failed: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    
    authorization = request.headers.get("authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token = authorization.replace("Bearer ", "")
    db = next(get_db())
    try:
        # Get user from token
        from sqlalchemy import func
        session = db.query(UserSession).filter(
            UserSession.access_token == token,
            UserSession.expires_at > func.now()
        ).first()
        if not session:
            raise HTTPException(status_code=401, detail="Token expired")
        
        user = db.query(User).filter(User.id == session.user_id).first()
        
        # Parse request body
        body = await request.json()
        
        # Create order
        order_no = f"ORD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{secrets.token_hex(4)}"
        product_id = body.get("product_id")
        payment_method = body.get("payment_method")
        
        # Products config
        PRODUCTS = {
            "pro_monthly": {"amount": 1900, "currency": "USD", "credits": 150, "months": 1},
            "pro_annual": {"amount": 19900, "currency": "USD", "credits": 150, "months": 12},
            "credits_100": {"amount": 999, "currency": "USD", "credits": 100, "months": 0},
            "credits_500": {"amount": 3999, "currency": "USD", "credits": 500, "months": 0},
        }
        
        if product_id not in PRODUCTS:
            raise HTTPException(status_code=400, detail="Invalid product")
        
        product = PRODUCTS[product_id]
        
        if payment_method != "paypal":
            raise HTTPException(status_code=400, detail="Only PayPal is supported")
        
        # Create order record
        order = PaymentOrder(
            user_id=user.id,
            order_no=order_no,
            product_type=body.get("product_type", "subscription"),
            product_id=product_id,
            amount=product["amount"],
            currency=product["currency"],
            payment_method=payment_method,
            credits_amount=product["credits"],
            subscription_months=product["months"]
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Create PayPal order
        paypal_result = await create_paypal_order_internal(order, product)
        order.paypal_order_id = paypal_result["order_id"]
        db.commit()
        
        return {
            "id": order.id,
            "order_no": order.order_no,
            "paypal_order_id": paypal_result["order_id"],
            "paypal_url": paypal_result["approve_url"],
            "amount": order.amount,
            "currency": order.currency,
            "status": order.status,
            "credits_amount": order.credits_amount,
            "created_at": order.created_at.isoformat()
        }
    finally:
        db.close()

@app.get("/api/payment/order/{order_no}")
async def get_order_status_api(order_no: str, request: Request):
    """Get order status"""
    try:
        from app.database import get_db
        from app.models import PaymentOrder, Session as UserSession
    except ImportError:
        raise HTTPException(status_code=500, detail="Database import failed")
    
    authorization = request.headers.get("authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token = authorization.replace("Bearer ", "")
    db = next(get_db())
    try:
        from sqlalchemy import func
        session = db.query(UserSession).filter(
            UserSession.access_token == token,
            UserSession.expires_at > func.now()
        ).first()
        if not session:
            raise HTTPException(status_code=401, detail="Token expired")
        
        order = db.query(PaymentOrder).filter(
            PaymentOrder.order_no == order_no,
            PaymentOrder.user_id == session.user_id
        ).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {
            "id": order.id,
            "order_no": order.order_no,
            "status": order.status,
            "amount": order.amount,
            "currency": order.currency,
            "credits_amount": order.credits_amount,
            "paid_at": order.paid_at.isoformat() if order.paid_at else None,
            "created_at": order.created_at.isoformat()
        }
    finally:
        db.close()

async def create_paypal_order_internal(payment_order, product: dict):
    """Create PayPal order"""
    import base64
    import httpx
    
    PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
    PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
    PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")
    
    # Debug logging
    print(f"[PayPal] Client ID configured: {bool(PAYPAL_CLIENT_ID)}", file=sys.stderr)
    print(f"[PayPal] API Base: {PAYPAL_API_BASE}", file=sys.stderr)
    
    if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="PayPal credentials not configured")
    
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
        print(f"[PayPal] Creating order for: {payment_order.order_no}", file=sys.stderr)
        
        response = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Basic {auth}"
            },
            json=order_data
        )
        
        print(f"[PayPal] Response status: {response.status_code}", file=sys.stderr)
        print(f"[PayPal] Response body: {response.text}", file=sys.stderr)
        
        if response.status_code != 201:
            raise HTTPException(status_code=500, detail=f"PayPal API error: {response.text}")
        
        data = response.json()
        print(f"[PayPal] Order ID: {data.get('id')}", file=sys.stderr)
        
        approve_url = None
        for link in data.get("links", []):
            print(f"[PayPal] Link rel: {link.get('rel')}, href: {link.get('href')}", file=sys.stderr)
            if link.get("rel") == "approve":
                approve_url = link.get("href")
                break
        
        if not approve_url:
            raise HTTPException(status_code=500, detail="PayPal approve URL not found in response")
        
        return {
            "order_id": data["id"],
            "approve_url": approve_url,
            "status": data["status"]
        }

# ==================== Helper Functions ====================

async def get_current_user_impl(authorization: str):
    """Get current user info (implementation)"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        from app.database import get_db
        from app.models import User, Session as UserSession
    except ImportError:
        raise HTTPException(status_code=500, detail="Database import failed")
    
    from sqlalchemy import func
    
    token = authorization.replace("Bearer ", "")
    db = next(get_db())
    try:
        session = db.query(UserSession).filter(
            UserSession.access_token == token, 
            UserSession.expires_at > func.now()
        ).first()
        if not session:
            raise HTTPException(status_code=401, detail="Token expired")
        
        user = db.query(User).filter(User.id == session.user_id).first()
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan": user.plan,
            "credits": user.credits
        }
    finally:
        db.close()
