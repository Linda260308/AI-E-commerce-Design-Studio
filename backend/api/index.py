from fastapi import FastAPI
from fastapi.responses import JSONResponse, RedirectResponse
import os
import secrets
import httpx
from sqlalchemy.orm import Session

# 导入所有路由模块
from app.routers import auth
from app.routers import users
from app.main import app

def handler(request, response):
    return app(request.scope, request.receive, response)
