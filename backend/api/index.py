"""
Vercel Serverless Function for FastAPI
"""
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 强制导入所有路由模块，确保路由被注册
from app.routers import auth, users

# 导入 FastAPI 应用
from app.main import app

# Vercel Python 运行时使用此签名
def handler(request):
    """Vercel serverless handler"""
    return app(request.scope, request.receive, request._send)
