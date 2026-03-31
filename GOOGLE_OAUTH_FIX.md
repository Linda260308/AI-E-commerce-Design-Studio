# Google OAuth 登录问题修复指南

## 问题诊断

**症状：** 点击 "Sign in with Google" 后显示 "login google failed"

**根本原因：** 后端 API 返回 500 错误，环境变量未正确配置或 Google Cloud Console 配置不完整

---

## 修复步骤

### 步骤 1️⃣：配置 Vercel 后端环境变量

1. 登录 Vercel: https://vercel.com/dashboard
2. 选择项目：`ai-poster-studio-b711`
3. 进入 **Settings** → **Environment Variables**
4. 添加/确认以下变量（使用你现有的值）：

```bash
GOOGLE_CLIENT_ID=<你的 Google Client ID>
GOOGLE_CLIENT_SECRET=<你的 Google Client Secret>
GOOGLE_REDIRECT_URI=https://ai-poster-studio-b711.vercel.app/api/auth/callback
DATABASE_URL=<你的 Neon DB 连接字符串>
```

**注意：** 使用 TOOLS.md 中已有的凭证值，不要修改

5. **重要：** 配置完成后，点击 **Redeploy** 重新部署项目

---

### 步骤 2️⃣：验证 Google Cloud Console 配置

1. 访问：https://console.cloud.google.com/apis/credentials
2. 找到你的 OAuth 2.0 Client ID（在 TOOLS.md 中查看）
3. 点击编辑图标 ✏️
4. 检查 **Authorized redirect URIs** 必须包含：
   ```
   https://ai-poster-studio-b711.vercel.app/api/auth/callback
   ```
5. 检查 **Authorized JavaScript origins**（如果有）：
   ```
   https://ai-poster-studio.vercel.app
   https://ai-poster-studio-b711.vercel.app
   ```
6. 保存配置

---

### 步骤 3️⃣：检查 OAuth 同意屏幕

1. 访问：https://console.cloud.google.com/apis/credentials/consent
2. 检查 **Publishing status**：
   - 如果是 **Testing**：确保你的 Google 账号已添加为测试用户
   - 如果是 **Production**：需要完成 OAuth 验证流程

3. 如果是 Testing 状态，添加测试用户：
   - 点击 **ADD USERS**
   - 输入你用来登录的 Google 邮箱
   - 保存

---

### 步骤 4️⃣：测试 API 端点

配置完成后，测试后端 API 是否正常：

```bash
# 测试 Google Auth URL 端点
curl https://ai-poster-studio-b711.vercel.app/api/auth/google/url
```

**预期响应：**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "..."
}
```

如果返回 500 错误，说明环境变量仍未正确配置。

---

### 步骤 5️⃣：查看 Vercel 日志

如果问题仍然存在：

1. 在 Vercel Dashboard 选择 `ai-poster-studio-b711`
2. 点击 **Deployments**
3. 选择最新的部署
4. 点击 **View Logs** → **Function Logs**
5. 查看错误信息

---

## 常见问题

### Q: 仍然显示 "login google failed"
**A:** 检查浏览器控制台（F12）的错误信息，通常是：
- CORS 错误 → 检查环境变量
- 401/403 错误 → 检查 Google Cloud Console 配置
- 500 错误 → 查看 Vercel 日志

### Q: Google 登录后回到登录页但没有 token
**A:** 检查回调 URL 是否正确：
- 必须是 `https://ai-poster-studio-b711.vercel.app/api/auth/callback`
- 不能是 `http://` 或其他域名

### Q: 提示 "access_blocked" 或 "App not verified"
**A:** OAuth 同意屏幕状态是 Testing，需要：
- 添加测试用户，或
- 完成 Production 验证流程

---

## 安全提醒 ⚠️

- **不要** 将 `GOOGLE_CLIENT_SECRET` 提交到 Git
- **不要** 在前端代码中暴露敏感信息
- 使用 Vercel Environment Variables 管理所有密钥

---

## 联系支持

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台错误截图（F12）
2. Vercel 函数日志错误信息
3. Google Cloud Console 配置截图

---

**最后更新：** 2026-03-31
