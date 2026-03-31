# Google OAuth 登录问题修复指南

## 问题诊断

**症状：** 点击 "Sign in with Google" 后显示 "login google failed"

**根本原因：** Vercel Python 服务器less 函数配置不正确，缺少 FastAPI 应用入口

---

## ✅ 已完成的修复

### 代码修复（已推送到 GitHub）

1. **重写 `api/index.py`** - 使用 FastAPI 框架
2. **添加 `pyproject.toml`** - 指定 Python 3.12 和依赖
3. **更新 `vercel.json`** - 正确的 FastAPI 部署配置

提交记录：`70c261d` - "fix: Migrate to FastAPI for Vercel serverless functions"

---

## 🔴 仍需手动配置

### 步骤 1：配置 Vercel 后端环境变量（必须！）

1. 访问：https://vercel.com/dashboard
2. 找到项目：`ai-poster-studio-b711`
3. 点击 **Settings** → **Environment Variables**
4. 添加以下变量（使用 TOOLS.md 中的值）：

| 变量名 | 说明 |
|--------|------|
| `GOOGLE_CLIENT_ID` | 你的 Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | 你的 Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://ai-poster-studio-b711.vercel.app/api/auth/callback` |
| `DATABASE_URL` | 你的 Neon PostgreSQL 连接字符串 |

5. **重要：** 保存后 Vercel 会自动重新部署

---

### 步骤 2：验证 Google Cloud Console 配置

1. 访问：https://console.cloud.google.com/apis/credentials
2. 编辑你的 OAuth 2.0 Client ID
3. 确保 **Authorized redirect URIs** 包含：
   ```
   https://ai-poster-studio-b711.vercel.app/api/auth/callback
   ```
4. 保存

---

### 步骤 3：检查 OAuth 同意屏幕

1. 访问：https://console.cloud.google.com/apis/credentials/consent
2. 如果是 **Testing** 状态，添加你的 Google 邮箱为测试用户
3. 保存

---

## 🧪 验证修复

### 测试 API 端点

配置完成后，等待 Vercel 部署完成（约 2-3 分钟），然后测试：

```bash
curl https://ai-poster-studio-b711.vercel.app/api/auth/google/url
```

**预期响应（200 OK）：**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "..."
}
```

### 测试登录流程

1. 访问：https://ai-poster-studio.vercel.app/login
2. 点击 "Sign in with Google"
3. 应该能正常跳转到 Google 登录页面
4. 登录后应重定向回 `/profile` 页面

---

## 📋 部署检查清单

- [ ] Vercel 环境变量已配置
- [ ] Google Cloud Console redirect URI 已添加
- [ ] OAuth 同意屏幕已配置（Testing 或 Production）
- [ ] Vercel 部署成功（无错误）
- [ ] API 端点返回 200 OK
- [ ] Google 登录流程正常工作

---

## 🔍 故障排查

### 如果 API 仍然返回 500 错误

1. 检查 Vercel 部署日志：
   - Vercel Dashboard → `ai-poster-studio-b711` → **Deployments**
   - 点击最新部署 → **View Logs** → **Function Logs**

2. 常见错误：
   - `GOOGLE_CLIENT_ID not configured` → 环境变量未设置
   - `Token exchange failed` → Google Cloud Console 配置错误
   - `Database connection failed` → DATABASE_URL 错误

### 如果 Google 登录后没有 token

1. 检查浏览器控制台（F12）的错误信息
2. 确认回调 URL 正确：`https://ai-poster-studio-b711.vercel.app/api/auth/callback`
3. 查看 Vercel Function Logs 中的详细错误

---

## 📞 需要帮助？

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台错误截图（F12）
2. Vercel 函数日志错误信息
3. Google Cloud Console 配置截图

---

**最后更新：** 2026-03-31  
**修复提交：** `70c261d`
