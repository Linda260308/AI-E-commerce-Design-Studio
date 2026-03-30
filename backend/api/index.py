"""
Vercel Python Serverless Function
Reference: https://vercel.com/docs/functions/serverless-functions/runtimes/python
"""
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 延迟加载 - 避免启动时连接数据库
print("Loading Vercel handler...", file=sys.stderr)

try:
    # 只导入 app，不立即连接数据库
    from app.main import app
    print("FastAPI app loaded", file=sys.stderr)
except Exception as e:
    print(f"Error loading app: {e}", file=sys.stderr)
    raise

# 导出 handler
handler = app
print("Handler exported successfully", file=sys.stderr)
