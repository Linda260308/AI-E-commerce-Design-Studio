# 🚀 AI Poster Studio 完整部署指南

## 📋 项目结构

```
AI-poster-studio/
├── backend/          # 后端 API (FastAPI + Python)
│   ├── app/
│   │   ├── main.py              # 主应用入口
│   │   ├── database.py          # 数据库配置
│   │   ├── models.py            # 数据库模型
│   │   ├── schemas.py           # Pydantic 模型
│   │   ├── services/
│   │   │   ├── auth_service.py  # Google OAuth 服务
│   │   │   └── qwen_service.py  # 阿里云 Qwen 服务
│   │   └── routers/
│   │       ├── auth.py          # 认证路由
│   │       └── users.py         # 用户路由
│   ├── requirements.txt         # Python 依赖
│   └── vercel.json             # Vercel 部署配置
└── frontend/         # 前端 (Next.js)
    ├── src/
    │   ├── pages/
    │   │   ├── login.tsx        # 登录页面
    │   │   └── editor.tsx       # 编辑器页面
    │   └── lib/
    │       └── auth.ts          # 认证工具
    └── package.json
```

---

## 第一步：创建数据库（Neon）

1. 访问 https://neon.tech
2. 点击 **Sign in with GitHub** 登录
3. 点击 **New Project**
4. 填写：
   - **Project name**: `ai-poster-studio`
   - **Database name**: `ai_poster_studio`
   - **Region**: `aws-ap-southeast-1` (新加坡)
5. 点击 **Create Project**
6. 复制 **Connection string**（格式类似）：
   ```
   postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/ai_poster_studio?sslmode=require
   ```

---

## 第二步：配置 Google OAuth

1. 访问 https://console.cloud.google.com/apis/credentials
2. 点击 **Create Credentials** → **OAuth client ID**
3. 首次需要创建 **OAuth consent screen**：
   - User Type: **External**
   - App name: `AI Poster Studio`
   - 其他直接 **Save and Continue**
4. 创建 OAuth 客户端：
   - Application type: **Web application**
   - Name: `AI Poster Studio Web`
   - **Authorized JavaScript origins**:
     ```
     https://ai-poster-studio.vercel.app
     https://ai-poster-studio-backend.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     https://ai-poster-studio-backend.vercel.app/api/auth/callback
     ```
5. 复制凭据：
   - **Client ID**: `xxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxx`

---

## 第三步：部署后端到 Vercel

### 3.1 创建后端项目

1. 访问 https://vercel.com/new
2. 点击 **Import Git Repository**
3. 选择仓库：`Linda260308/AI-poster-studio`
4. 配置项目：
   - **Project Name**: `ai-poster-studio-backend`
   - **Root Directory**: 点击 **Edit** → 输入 `backend`
   - **Framework Preset**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Install Command**: 留空

### 3.2 添加环境变量

在 **Environment Variables** 部分添加：

```bash
# 数据库（从 Neon 复制）
DATABASE_URL=postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/ai_poster_studio?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=你的 Client ID
GOOGLE_CLIENT_SECRET=你的 Client Secret
GOOGLE_REDIRECT_URI=https://ai-poster-studio-backend.vercel.app/api/auth/callback

# 阿里云 Qwen API
QWEN_API_KEY=sk-46c536ffaf7140679d76a35016d9a488
```

### 3.3 部署

1. 点击 **Deploy**
2. 等待部署完成（约 2-3 分钟）
3. 访问 `https://ai-poster-studio-backend.vercel.app/health` 验证

✅ 应该返回：`{"status":"healthy"}`

---

## 第四步：部署前端到 Vercel

### 4.1 创建前端项目

1. 访问 https://vercel.com/new
2. 选择仓库：`Linda260308/AI-poster-studio`
3. 配置项目：
   - **Project Name**: `ai-poster-studio`
   - **Root Directory**: 点击 **Edit** → 输入 `frontend`
   - **Framework Preset**: `Next.js`
   - **Build Command**: 留空（默认）
   - **Install Command**: 留空

### 4.2 添加环境变量

在 **Environment Variables** 部分添加：

```bash
# 后端 API 地址
NEXT_PUBLIC_BACKEND_URL=https://ai-poster-studio-backend.vercel.app

# 应用地址
NEXT_PUBLIC_APP_URL=https://ai-poster-studio.vercel.app
```

### 4.3 部署

1. 点击 **Deploy**
2. 等待部署完成
3. 访问 `https://ai-poster-studio.vercel.app` 验证

---

## 第五步：测试登录

1. 访问 https://ai-poster-studio.vercel.app/login
2. 点击 **使用 Google 账号登录**
3. 选择你的 Google 账号
4. ✅ 成功登录后跳转到编辑器页面

---

## ✅ 验证清单

- [ ] Neon 数据库已创建
- [ ] Google OAuth 已配置
- [ ] 后端项目已部署（ai-poster-studio-backend）
- [ ] 前端项目已部署（ai-poster-studio）
- [ ] 环境变量已配置
- [ ] 健康检查通过（/health）
- [ ] Google 登录测试成功

---

## 🔧 故障排查

### 后端部署失败

**错误**：`Build Failed`

**解决**：
1. 检查 Root Directory 是否为 `backend`
2. 检查 Build Command 是否为 `pip install -r requirements.txt`
3. 查看部署日志具体错误信息

### 数据库连接失败

**错误**：`connection refused`

**解决**：
1. 检查 DATABASE_URL 是否正确
2. 确保包含 `?sslmode=require`
3. 在 Neon Dashboard 检查数据库状态

### OAuth 回调失败

**错误**：`redirect_uri_mismatch`

**解决**：
1. 检查 Google Cloud Console 中的 redirect URIs
2. 确保与 Vercel 环境变量一致
3. 格式：`https://xxx.vercel.app/api/auth/callback`

---

## 📞 需要帮助？

查看详细文档：
- `QUICK_START.md` - 快速开始指南
- `README.md` - 项目说明

---

**部署完成后，你的应用将拥有：**
- ✅ Google OAuth 2.0 登录
- ✅ PostgreSQL 数据库（Neon）
- ✅ 用户会话管理
- ✅ 海报创作历史
- ✅ 积分管理系统

🎉 **祝你部署成功！**
