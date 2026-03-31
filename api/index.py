"""
Vercel Python Serverless Function using FastAPI
"""
import sys
import os
import secrets
import traceback
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.responses import RedirectResponse, JSONResponse

# 确保 api 目录在 Python 路径中 (for Vercel)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

app = FastAPI()

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
            session_token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(days=30)
            session_id = f"session_{secrets.token_hex(16)}"
            app_session = UserSession(
                id=session_id,
                user_id=user.id,
                access_token=session_token,
                refresh_token=secrets.token_urlsafe(32),
                expires_at=expires_at
            )
            db.add(app_session)
            db.commit()
            
            redirect_url = f"https://ai-poster-studio.vercel.app/login?token={session_token}"
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
