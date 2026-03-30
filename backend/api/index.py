"""
Vercel Python Serverless Function - Lightweight Handler
Reference: https://vercel.com/docs/functions/serverless-functions/runtimes/python
"""
import sys
import os
import json
import secrets

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("Loading lightweight handler...", file=sys.stderr)

async def handler(scope, receive, send):
    """ASGI handler for Vercel"""
    if scope['type'] != 'http':
        return
    
    path = scope.get('path', '/')
    method = scope.get('method', 'GET')
    
    # 处理 /health 端点
    if path == '/health' or path == '/':
        await send({
            'type': 'http.response.start',
            'status': 200,
            'headers': [[b'content-type', b'application/json']],
        })
        await send({
            'type': 'http.response.body',
            'body': json.dumps({'status': 'healthy', 'path': path}).encode(),
        })
        return
    
    # 处理 /api/auth/google/url 端点
    if path == '/api/auth/google/url' and method == 'GET':
        try:
            client_id = os.getenv("GOOGLE_CLIENT_ID", "")
            redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "https://ai-poster-studio-b711.vercel.app/api/auth/callback")
            state = secrets.token_urlsafe(32)
            
            if not client_id:
                raise Exception("GOOGLE_CLIENT_ID not configured")
            
            auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=openid%20email%20profile&state={state}&access_type=offline&prompt=consent"
            
            await send({
                'type': 'http.response.start',
                'status': 200,
                'headers': [[b'content-type', b'application/json']],
            })
            await send({
                'type': 'http.response.body',
                'body': json.dumps({'authorization_url': auth_url, 'state': state}).encode(),
            })
            print(f"[Google OAuth] Auth URL generated successfully", file=sys.stderr)
            return
        except Exception as e:
            print(f"[Google OAuth] Error: {e}", file=sys.stderr)
            await send({
                'type': 'http.response.start',
                'status': 500,
                'headers': [[b'content-type', b'application/json']],
            })
            await send({
                'type': 'http.response.body',
                'body': json.dumps({'error': str(e)}).encode(),
            })
            return
    
    # 处理 /api/auth/callback 端点
    if path == '/api/auth/callback' and method == 'GET':
        # 解析查询参数
        query_string = scope.get('query_string', b'').decode()
        params = {}
        if query_string:
            for param in query_string.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    params[key] = value
        
        code = params.get('code', '')
        state = params.get('state', '')
        
        if not code:
            # 重定向回登录页带错误
            redirect_url = "https://ai-poster-studio.vercel.app/login?error=no_code"
            await send({
                'type': 'http.response.start',
                'status': 302,
                'headers': [[b'location', redirect_url.encode()]],
            })
            await send({'type': 'http.response.body', 'body': b''})
            return
        
        # 处理 OAuth 回调 - 需要数据库，延迟导入
        try:
            from app.database import get_db
            from app.models import User, Session as UserSession, OAuthAccount
            from sqlalchemy.orm import Session
            from datetime import datetime, timedelta
            import httpx
            
            client_id = os.getenv("GOOGLE_CLIENT_ID", "")
            client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
            redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "https://ai-poster-studio-b711.vercel.app/api/auth/callback")
            
            print(f"[Google OAuth] Starting callback. Client ID: {client_id[:10]}...", file=sys.stderr)
            
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
                print(f"[Google OAuth] Token response status: {token_resp.status_code}", file=sys.stderr)
                
                if "error" in token_data:
                    print(f"[Google OAuth] Token exchange error: {token_data}", file=sys.stderr)
                    redirect_url = f"https://ai-poster-studio.vercel.app/login?error=token_error"
                    await send({
                        'type': 'http.response.start',
                        'status': 302,
                        'headers': [[b'location', redirect_url.encode()]],
                    })
                    await send({'type': 'http.response.body', 'body': b''})
                    return
                
                access_token = token_data.get("access_token")
                print(f"[Google OAuth] Token exchange successful", file=sys.stderr)
            
            # 获取用户信息
            async with httpx.AsyncClient() as client:
                user_resp = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                google_user = user_resp.json()
                print(f"[Google OAuth] User info response status: {user_resp.status_code}", file=sys.stderr)
            
            google_id = google_user.get("id")
            email = google_user.get("email")
            name = google_user.get("name")
            avatar_url = google_user.get("picture")
            print(f"[Google OAuth] User: {email} ({google_id})", file=sys.stderr)
            
            # 查找或创建用户
            db = next(get_db())
            try:
                oauth = db.query(OAuthAccount).filter(OAuthAccount.provider_account_id == google_id).first()
                if oauth:
                    user = db.query(User).filter(User.id == oauth.user_id).first()
                    oauth.access_token = access_token
                    print(f"[Google OAuth] Existing user found: {user.id}", file=sys.stderr)
                else:
                    user_id = f"user_{secrets.token_hex(16)}"
                    user = User(id=user_id, email=email, name=name, avatar_url=avatar_url, google_id=google_id, credits=5, plan="free")
                    db.add(user)
                    db.flush()
                    oauth_id = f"oauth_{secrets.token_hex(16)}"
                    oauth = OAuthAccount(id=oauth_id, user_id=user.id, provider="google", provider_account_id=google_id, access_token=access_token)
                    db.add(oauth)
                    print(f"[Google OAuth] New user created: {user_id}", file=sys.stderr)
                
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
                print(f"[Google OAuth] Session created: {session_id}", file=sys.stderr)
                
                # 重定向到前端登录页面，携带 token
                redirect_url = f"https://ai-poster-studio.vercel.app/login?token={session_token}"
            finally:
                db.close()
            
            await send({
                'type': 'http.response.start',
                'status': 302,
                'headers': [[b'location', redirect_url.encode()]],
            })
            await send({'type': 'http.response.body', 'body': b''})
            return
            
        except Exception as e:
            import traceback
            error_stack = traceback.format_exc()
            print(f"[Google OAuth] ERROR: {e}", file=sys.stderr)
            print(f"[Google OAuth] Stack: {error_stack}", file=sys.stderr)
            redirect_url = "https://ai-poster-studio.vercel.app/login?error=auth_failed"
            await send({
                'type': 'http.response.start',
                'status': 302,
                'headers': [[b'location', redirect_url.encode()]],
            })
            await send({'type': 'http.response.body', 'body': b''})
            return
    
    # 404 for other routes
    await send({
        'type': 'http.response.start',
        'status': 404,
        'headers': [[b'content-type', b'application/json']],
    })
    await send({
        'type': 'http.response.body',
        'body': json.dumps({'error': 'Not found'}).encode(),
    })

print("Handler ready", file=sys.stderr)
