"""
Vercel Serverless Function - FastAPI
https://vercel.com/docs/functions/serverless-functions/runtimes/python#using-async
"""
import sys
import os

# 关键：添加正确的路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# 必须先导入路由，触发路由注册
import app.routers.auth
import app.routers.users

# 然后导入应用
from app.main import app

# Vercel 需要这个签名
async def handler(scope, receive, send):
    await app(scope, receive, send)
