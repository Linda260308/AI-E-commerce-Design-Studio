"""
Vercel Serverless Function Entry Point for FastAPI
"""
import sys
import os

# 添加父目录到路径，以便导入 app 模块
sys.path.insert(0, os.path.dirname(__file__))

# 强制导入所有路由模块，确保路由被注册
from app.routers import auth, users

# 导入 FastAPI 应用
from app.main import app

# 导出 handler
handler = app
