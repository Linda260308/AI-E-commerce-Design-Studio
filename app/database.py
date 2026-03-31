from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ai_poster_studio")

# 延迟初始化 - 只在第一次使用时创建连接
_engine = None
_SessionLocal = None
Base = declarative_base()

def get_engine():
    global _engine
    if _engine is None:
        print(f"[Database] Initializing engine with DATABASE_URL: {DATABASE_URL[:20]}...", file=__import__('sys').stderr)
        _engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=5, max_overflow=10)
    return _engine

def get_session_local():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal

def get_db():
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()
