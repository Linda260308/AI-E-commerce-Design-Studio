"""
Vercel Serverless Function Entry Point for FastAPI
使用 Mangum 适配 FastAPI 到 AWS Lambda/Vercel
"""
import sys
import os

# 添加父目录到路径，以便导入 app 模块
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# 导入 FastAPI 应用
from app.main import app

# 使用 Mangum 适配 ASGI 应用
try:
    from mangum import Mangum
    handler = Mangum(app, lifespan="off")
except ImportError:
    # 如果没有 mangum，直接导出 app（Vercel 可能直接支持 ASGI）
    handler = app
