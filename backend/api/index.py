"""
Vercel Python Serverless Function
Reference: https://vercel.com/docs/functions/serverless-functions/runtimes/python
"""
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 强制加载所有模块
print("Loading modules...", file=sys.stderr)

try:
    from app.database import engine, Base
    from app import models
    print("Database models loaded", file=sys.stderr)
except Exception as e:
    print(f"Error loading models: {e}", file=sys.stderr)
    raise

try:
    from app.routers import auth
    print("Auth router loaded", file=sys.stderr)
except Exception as e:
    print(f"Error loading auth router: {e}", file=sys.stderr)
    raise

try:
    from app.routers import users
    print("Users router loaded", file=sys.stderr)
except Exception as e:
    print(f"Error loading users router: {e}", file=sys.stderr)
    raise

try:
    from app.main import app
    print("FastAPI app loaded", file=sys.stderr)
except Exception as e:
    print(f"Error loading app: {e}", file=sys.stderr)
    raise

# 导出 handler
handler = app
print("Handler exported successfully", file=sys.stderr)
