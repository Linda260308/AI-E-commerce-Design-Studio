import secrets
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import httpx

from ..database import get_db
from ..models import User, Session as UserSession, OAuthAccount
from ..schemas import GoogleAuthUrlResponse, AuthResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["认证"])

@router.get("/google/url", response_model=GoogleAuthUrlResponse)
async def get_google_auth_url():
    client_id = __import__('os').getenv("GOOGLE_CLIENT_ID")
    redirect_uri = __import__('os').getenv("GOOGLE_REDIRECT_URI", "https://ai-poster-studio-b711.vercel.app/api/auth/callback")
    state = secrets.token_urlsafe(32)
    url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=openid%20email%20profile&state={state}&access_type=offline&prompt=consent"
    return GoogleAuthUrlResponse(authorization_url=url, state=state)

@router.get("/callback")
async def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    import traceback
    error_detail = "unknown"
    try:
        client_id = __import__('os').getenv("GOOGLE_CLIENT_ID")
        client_secret = __import__('os').getenv("GOOGLE_CLIENT_SECRET")
        redirect_uri = __import__('os').getenv("GOOGLE_REDIRECT_URI", "https://ai-poster-studio-b711.vercel.app/api/auth/callback")
        
        print(f"[Google OAuth] Starting callback. Client ID: {client_id[:10]}... Redirect URI: {redirect_uri}")
        
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
            print(f"[Google OAuth] Token response status: {token_resp.status_code}")
            
            if "error" in token_data:
                print(f"[Google OAuth] Token exchange error: {token_data}")
                error_detail = f"token_error:{token_data.get('error')}"
                raise Exception(f"Token exchange failed: {token_data.get('error')}")
            
            access_token = token_data.get("access_token")
            print(f"[Google OAuth] Token exchange successful")
        
        # 获取用户信息
        async with httpx.AsyncClient() as client:
            user_resp = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            google_user = user_resp.json()
            print(f"[Google OAuth] User info response status: {user_resp.status_code}")
        
        google_id = google_user.get("id")
        email = google_user.get("email")
        name = google_user.get("name")
        avatar_url = google_user.get("picture")
        print(f"[Google OAuth] User: {email} ({google_id})")
        
        # 查找或创建用户
        oauth = db.query(OAuthAccount).filter(OAuthAccount.provider_account_id == google_id).first()
        if oauth:
            user = db.query(User).filter(User.id == oauth.user_id).first()
            # 更新 token
            oauth.access_token = access_token
            print(f"[Google OAuth] Existing user found: {user.id}")
        else:
            user_id = f"user_{secrets.token_hex(16)}"
            user = User(id=user_id, email=email, name=name, avatar_url=avatar_url, google_id=google_id, credits=5, plan="free")
            db.add(user)
            db.flush()  # 获取 user.id
            oauth = OAuthAccount(user_id=user.id, provider="google", provider_account_id=google_id, access_token=access_token)
            db.add(oauth)
            print(f"[Google OAuth] New user created: {user_id}")
        
        # 创建会话
        session_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=30)
        app_session = UserSession(user_id=user.id, access_token=session_token, refresh_token=secrets.token_urlsafe(32), expires_at=expires_at)
        db.add(app_session)
        db.commit()
        print(f"[Google OAuth] Session created successfully")
        
        # 重定向到前端登录页面，携带 token
        return RedirectResponse(url=f"https://ai-poster-studio.vercel.app/login?token={session_token}")
    except Exception as e:
        error_msg = f"{str(e)}"
        error_stack = traceback.format_exc()
        print(f"[Google OAuth] ERROR: {error_msg}")
        print(f"[Google OAuth] Stack trace: {error_stack}")
        # 将错误信息编码到 URL 中
        import urllib.parse
        error_encoded = urllib.parse.quote(f"{error_detail}:{error_msg}", safe='')
        return RedirectResponse(url=f"https://ai-poster-studio.vercel.app/login?error=auth_failed&error_detail={error_encoded}")

@router.get("/me")
async def get_current_user(authorization: str = Depends(lambda x: x), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    token = authorization.replace("Bearer ", "")
    session = db.query(UserSession).filter(UserSession.access_token == token, UserSession.expires_at > func.now()).first()
    if not session:
        raise HTTPException(status_code=401, detail="Token expired")
    user = db.query(User).filter(User.id == session.user_id).first()
    return UserResponse.model_validate(user)

@router.post("/logout")
async def logout(authorization: str = Depends(lambda x: x), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        db.query(UserSession).filter(UserSession.access_token == token).delete()
        db.commit()
    return {"success": True}
