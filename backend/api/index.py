"""
Vercel Serverless Function for FastAPI
参考：https://vercel.com/docs/functions/serverless-functions/runtimes/python
"""
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 导入 FastAPI 应用
from app.main import app

# Vercel Python 运行时使用此签名
def handler(request):
    """Vercel serverless handler"""
    return app(request.scope, request.receive, request._send)
