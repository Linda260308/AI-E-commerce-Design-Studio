#!/usr/bin/env python3
"""
重置数据库表 - 删除所有表并重新创建
用于修复表结构问题
"""
import sys
import os

# 添加父目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database import engine, Base
from app import models  # 导入模型以注册表

def reset_database():
    """删除所有表并重新创建"""
    print("⚠️  警告：这将删除所有数据库表！")
    print("此操作不可逆，请确认你已备份重要数据。")
    print()
    
    response = input("确认要删除所有表吗？(yes/no): ")
    if response.lower() != 'yes':
        print("❌ 操作已取消")
        return
    
    print("\n🗑️  正在删除所有表...")
    Base.metadata.drop_all(bind=engine)
    print("✅ 表已删除")
    
    print("\n📝 正在重新创建表...")
    Base.metadata.create_all(bind=engine)
    print("✅ 表已创建")
    
    print("\n✅ 数据库重置完成！")
    print("\n创建的表:")
    for table in Base.metadata.sorted_tables:
        print(f"  - {table.name}")

if __name__ == "__main__":
    reset_database()
