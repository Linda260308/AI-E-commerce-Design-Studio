# Google OAuth 登录部署指南

## ✅ 已配置的功能

- Google OAuth 2.0 认证
- PostgreSQL 数据库支持
- 用户会话管理
- 海报创作历史

## 📁 新增文件

### 后端
- `backend/app/database.py` - 数据库配置
- `backend/app/models.py` - 数据库模型
- `backend/app/schemas.py` - 数据验证模型
- `backend/app/services/auth_service.py` - Google OAuth 服务
- `backend/app/routers/auth.py` - 认证 API
- `backend/app/routers/users.py` - 用户 API
- `backend/init_db.py` - 数据库初始化

### 前端
- `frontend/src/lib/auth.ts` - 认证工具函数
- `frontend/src/pages/login.tsx` - 更新支持 Google 登录

## 🔑 环境变量配置

### 后端环境变量（Vercel）

```
DATABASE_URL=你的 PostgreSQL 连接字符串
GOOGLE_CLIENT_ID=从 Google Cloud Console 获取
GOOGLE_CLIENT_SECRET=从 Google Cloud Console 获取
GOOGLE_REDIRECT_URI=https://ai-poster-studio.vercel.app/api/auth/callback
QWEN_API_KEY=sk-xxxxxxxxxxxxx
```

### 前端环境变量（Vercel）

```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
NEXT_PUBLIC_APP_URL=https://ai-poster-studio.vercel.app
```

## 🚀 部署步骤

1. **创建数据库** - Vercel Postgres 或 Neon
2. **配置 Google Cloud Console** - 添加重定向 URI
3. **配置 Vercel 环境变量**
4. **推送代码并部署**

## 📊 API 端点

- `GET /api/auth/google/url` - 获取 Google 授权 URL
- `GET/POST /api/auth/callback` - OAuth 回调
- `GET /api/users/me` - 获取当前用户
- `POST /api/auth/logout` - 登出
