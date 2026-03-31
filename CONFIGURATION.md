# AI Poster Studio - 完整配置文档

**最后更新：** 2026-03-31  
**状态：** ✅ 生产环境正常运行

---

## 📋 项目架构

```
┌─────────────────────────────────────┐
│   Frontend (Vercel)                 │
│   ai-poster-studio.vercel.app       │
└──────────────┬──────────────────────┘
               │
               │ API Calls
               │
└──────────────▼──────────────────────┐
│   Backend (Vercel)                  │
│   ai-poster-studio-backend.vercel.app│
└──────────────┬──────────────────────┘
               │
               │ Database
               │
└──────────────▼──────────────────────┐
│   Neon PostgreSQL                   │
└─────────────────────────────────────┘
```

---

## 🔐 Google Cloud Console 配置

**访问：** https://console.cloud.google.com/apis/credentials

### OAuth 2.0 Client ID

**Client ID:** 查看 TOOLS.md 或 Vercel 环境变量

**Authorized redirect URIs:**
```
https://ai-poster-studio-backend.vercel.app/api/auth/callback
https://ai-poster-studio.vercel.app/api/auth/callback
http://localhost:3000/api/auth/callback
http://localhost:8000/api/auth/callback
```

---

## 🔑 Vercel 后端环境变量

**项目：** `ai-poster-studio-backend`

**Settings → Environment Variables:**

| 变量名 | 说明 | 环境 |
|--------|------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID（见 TOOLS.md） | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret（见 TOOLS.md） | Production, Preview |
| `GOOGLE_REDIRECT_URI` | `https://ai-poster-studio-backend.vercel.app/api/auth/callback` | Production, Preview |
| `DATABASE_URL` | Neon PostgreSQL 连接字符串（见 TOOLS.md） | Production, Preview |

---

## 🌐 Vercel 前端环境变量

**项目：** `ai-poster-studio`

**Settings → Environment Variables:**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://ai-poster-studio-backend.vercel.app` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://ai-poster-studio.vercel.app` | Production, Preview |

---

## 🏗️ Vercel 项目配置

### 后端项目 (ai-poster-studio-backend)

**Settings → Build & Development Settings:**

| 设置项 | 值 |
|--------|-----|
| **Framework Preset** | Python |
| **Root Directory** | `./` |
| **Build Command** | `pip install -r requirements.txt` |
| **Output Directory** | （留空） |
| **Install Command** | （留空） |
| **Node.js Version** | `20.x` |

### 前端项目 (ai-poster-studio)

**Settings → Build & Development Settings:**

| 设置项 | 值 |
|--------|-----|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | （留空） |
| **Install Command** | `npm install` |

---

## 📁 项目结构

```
AI-poster-studio/
├── index.py                    # FastAPI 后端入口
├── app.py                      # Vercel Python 入口点
├── requirements.txt            # Python 依赖
├── pyproject.toml              # Python 配置
├── app/                        # 后端模块
│   ├── __init__.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── users.py
│   └── services/
│       ├── __init__.py
│       └── qwen_service.py
└── frontend/                   # Next.js 前端
    ├── src/
    │   ├── pages/
    │   │   ├── login.tsx
    │   │   ├── profile.tsx
    │   │   └── editor.tsx
    │   └── lib/
    │       └── auth.ts
    ├── .env.local
    └── package.json
```

---

## 🔧 关键修复记录

### 2026-03-31

1. **Python 入口点问题**
   - 创建 `app.py` 导出 FastAPI 应用
   - 添加 `app/__init__.py` 使 Python 包可导入

2. **CORS 跨域问题**
   - 添加 CORSMiddleware 到 FastAPI
   - 允许前端域名访问后端 API

3. **Google OAuth 配置**
   - 正确配置 redirect_uri
   - 使用正确的后端域名

4. **Token 传递问题**
   - 缩短 token 长度避免 URL 过长
   - 添加 URL 编码确保 token 正确传递

---

## ✅ 功能验证清单

### 登录流程
- [ ] 访问 https://ai-poster-studio.vercel.app/login
- [ ] 点击 "Sign in with Google"
- [ ] 正常跳转到 Google 登录页面
- [ ] 登录成功后跳转回个人中心
- [ ] 个人中心显示用户信息

### 个人中心
- [ ] 显示用户邮箱
- [ ] 显示用户名称
- [ ] 显示账户计划（free/pro）
- [ ] 显示可用积分

### API 端点
- [ ] `GET /health` - 健康检查
- [ ] `GET /api/auth/me` - 获取当前用户
- [ ] `GET /api/auth/google/url` - 获取 Google OAuth URL
- [ ] `GET /api/auth/callback` - Google OAuth 回调
- [ ] `POST /api/auth/logout` - 登出

---

## 🚨 常见问题排查

### 1. Google 登录失败 - redirect_uri_mismatch

**原因：** Google Cloud Console 中配置的回调地址不正确

**解决：**
1. 访问 https://console.cloud.google.com/apis/credentials
2. 编辑 OAuth 2.0 Client ID
3. 确保 Authorized redirect URIs 包含：
   ```
   https://ai-poster-studio-backend.vercel.app/api/auth/callback
   ```

### 2. 个人中心显示 "Failed to fetch" - CORS 错误

**原因：** 后端缺少 CORS 配置

**解决：**
1. 确保 `index.py` 包含 CORSMiddleware 配置
2. 重新部署后端项目
3. 清除浏览器缓存

### 3. 后端部署失败 - No python entrypoint found

**原因：** Vercel 找不到 Python 入口点

**解决：**
1. 确保项目根目录有 `app.py` 或 `index.py`
2. 确保文件中有 `app = FastAPI()` 实例
3. 确保有 `requirements.txt`
4. 删除并重新创建 Vercel 项目

### 4. 导入错误 - 'app' is not a package

**原因：** 缺少 `__init__.py` 文件

**解决：**
```bash
touch app/__init__.py
touch app/routers/__init__.py
touch app/services/__init__.py
```

---

## 📞 支持资源

- **GitHub 仓库：** https://github.com/Linda260308/AI-poster-studio
- **Vercel Dashboard：** https://vercel.com/dashboard
- **Google Cloud Console：** https://console.cloud.google.com/apis/credentials
- **Neon Database：** https://console.neon.tech

---

## 💡 重要提醒

1. **不要删除环境变量** - 所有环境变量都是必需的
2. **不要修改 redirect_uri** - 必须与 Google Cloud Console 一致
3. **部署顺序** - 先部署后端，再部署前端
4. **清除缓存** - 如果遇到问题，清除浏览器缓存和 Vercel Build Cache

---

**文档结束** ✨
