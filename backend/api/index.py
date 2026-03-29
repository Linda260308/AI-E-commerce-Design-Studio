"""
Vercel Serverless Function - Minimal FastAPI
"""
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 先导入依赖模块
import sqlalchemy
import httpx
import authlib

# 导入路由（触发路由注册）
from app.routers import auth, users

# 导入应用
from app.main import app

def handler(request):
    return app(request.scope, request.receive, request._send)
