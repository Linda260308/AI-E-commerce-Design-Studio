import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 导入路由模块（触发路由注册）
from app.routers import auth, users

# 导入应用
from app.main import app

# 导出为 serverless handler
handler = app
