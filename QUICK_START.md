# 🚀 快速开始 - 5 分钟配置数据库和 OAuth

## 第一步：创建数据库（2 分钟）

### 使用 Neon（推荐 ⭐）

1. 访问 https://neon.tech
2. 点击 **Sign in with GitHub**（使用 GitHub 账号登录）
3. 登录后点击 **New Project**
4. 填写：
   - **Project name**: `ai-poster-studio`
   - **Database name**: `ai_poster_studio`
   - **Region**: `aws-ap-southeast-1` (新加坡，离中国近)
5. 点击 **Create Project**

✅ 创建完成后，复制 **Connection Details** 中的连接字符串！

格式类似：
```
postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/ai_poster_studio?sslmode=require
```

---

## 第二步：配置 Google OAuth（3 分钟）

1. 访问 https://console.cloud.google.com/apis/credentials

2. **创建 OAuth 同意屏幕**（首次需要）：
   - User Type: **External**
   - App name: `AI Poster Studio`
   - Email: 你的邮箱
   - 点击 **Save and Continue**（其他页面也直接继续）
   - Test users: 添加你的邮箱

3. **创建凭据**：
   - 点击 **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `AI Poster Studio Web`
   - **Authorized JavaScript origins**:
     ```
     https://ai-poster-studio.vercel.app
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://ai-poster-studio.vercel.app/api/auth/callback
     http://localhost:3000/api/auth/callback
     ```
   - 点击 **Create**

4. **复制凭据**：
   - Client ID: `xxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxx`

---

## 第三步：配置 Vercel 环境变量（1 分钟）

### 后端项目

1. 进入后端项目 → **Settings** → **Environment Variables**
2. 添加以下变量：

```
DATABASE_URL=从 Vercel Storage 页面复制 POSTGRES_URL
GOOGLE_CLIENT_ID=你的 Client ID（从 Google Cloud Console 复制）
GOOGLE_CLIENT_SECRET=你的 Client Secret（从 Google Cloud Console 复制）
GOOGLE_REDIRECT_URI=https://ai-poster-studio.vercel.app/api/auth/callback
QWEN_API_KEY=你的阿里云 API Key
```

3. 点击 **Save**

### 前端项目

1. 进入前端项目 → **Settings** → **Environment Variables**
2. 添加以下变量：

```
NEXT_PUBLIC_BACKEND_URL=https://你的后端项目.vercel.app
NEXT_PUBLIC_APP_URL=https://ai-poster-studio.vercel.app
```

3. 点击 **Save**

---

## 第四步：重新部署（1 分钟）

1. 进入后端项目 → **Deployments**
2. 点击 **Redeploy**（最新部署）
3. 等待部署完成

---

## 第五步：测试登录（1 分钟）

1. 访问 https://ai-poster-studio.vercel.app/login
2. 点击 **使用 Google 账号登录**
3. 选择你的 Google 账号
4. ✅ 成功登录后会跳转到编辑器页面

---

## ✅ 验证清单

- [ ] 数据库已创建（Vercel Storage 页面可见）
- [ ] 环境变量已配置（后端和前端）
- [ ] Google OAuth 已配置（Client ID 和 Secret）
- [ ] 重定向 URI 已添加
- [ ] 后端已重新部署
- [ ] 前端已重新部署
- [ ] 登录测试成功

---

## 🔍 故障排查

### 问题：数据库连接失败

**检查**：
1. DATABASE_URL 是否正确
2. Vercel Postgres 是否已创建
3. 查看 Vercel Functions 日志

### 问题：OAuth 回调失败

**检查**：
1. GOOGLE_REDIRECT_URI 是否正确
2. Google Cloud Console 中是否添加了相同的 URI
3. 查看浏览器控制台错误

### 问题：404 Not Found

**解决**：
- 确保后端项目已部署
- 检查 NEXT_PUBLIC_BACKEND_URL 是否正确
