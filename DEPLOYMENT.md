# 部署指南

## 快速开始

### 1. 环境配置

```bash
# 复制环境变量示例文件
cd frontend
cp .env.example .env.local

# 编辑 .env.local 填入你的配置
# - APIYI_KEY: API 易的密钥
# - JWT_SECRET: 随机生成的密钥
# - PAYPAL_CLIENT_ID: PayPal 商家账号
```

### 2. 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd ../backend
pip install -r requirements.txt
```

### 3. 本地开发

```bash
# 启动前端 (端口 3000)
cd frontend
npm run dev

# 启动后端 (端口 8000)
cd ../backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

访问 http://localhost:3000

---

## 生产部署

### 前端部署到 Vercel

1. 安装 Vercel CLI:
```bash
npm i -g vercel
```

2. 登录并部署:
```bash
cd frontend
vercel login
vercel --prod
```

3. 配置环境变量 (在 Vercel 控制台):
- `APIYI_KEY`
- `JWT_SECRET`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

### 后端部署

#### 选项 A: AWS Lambda + API Gateway

```bash
# 使用 serverless framework
npm i -g serverless
cd backend
serverless deploy
```

#### 选项 B: Docker 部署到 GCP/AWS

```bash
# 构建 Docker 镜像
cd backend
docker build -t ai-poster-backend .

# 推送到容器仓库
docker push gcr.io/your-project/ai-poster-backend

# 部署到 Cloud Run
gcloud run deploy ai-poster-backend \
  --image gcr.io/your-project/ai-poster-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 数据库设置

```sql
-- PostgreSQL 初始化
CREATE DATABASE ai_poster_studio;
CREATE USER ai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_poster_studio TO ai_user;
```

### 存储配置 (CloudFlare R2)

1. 创建 R2 bucket
2. 配置 CORS 允许前端访问
3. 在环境变量中填入访问密钥

---

## API 密钥获取

### API 易 (Nano Banana 2)
1. 访问 https://apiyi.com
2. 注册账号
3. 创建 API 密钥
4. 复制到 `.env.local`

### PayPal
1. 访问 https://developer.paypal.com
2. 创建商家账号
3. 获取 Client ID
4. 配置到前端环境变量

---

## 监控与日志

### 推荐工具
- **前端**: Vercel Analytics
- **后端**: Sentry / Datadog
- **数据库**: pgAdmin / DataGrip
- **日志**: Logtail / Papertrail

---

## 安全建议

1. ✅ 使用 HTTPS (Vercel 自动提供)
2. ✅ 启用 CORS 限制
3. ✅ 设置强 JWT_SECRET
4. ✅ 定期轮换 API 密钥
5. ✅ 启用数据库备份
6. ✅ 配置速率限制

---

## 故障排查

### 常见问题

**Q: AI 生成失败**
- 检查 APIYI_KEY 是否正确
- 确认账户有足够额度
- 查看后端日志

**Q: 支付失败**
- 验证 PayPal Client ID
- 检查网络连接
- 确认商家账号状态

**Q: 图片上传失败**
- 检查文件大小限制
- 确认存储桶权限
- 查看 CORS 配置

---

## 成本估算

### 月度成本 (预估)
- Vercel Pro: $20/mo
- CloudFlare R2: ~$5/mo (100GB)
- API 易调用: ~$50/mo (1000 次)
- PostgreSQL: ~$15/mo
- **总计**: ~$90/mo

### 优化建议
- 使用图片缓存减少 AI 调用
- 压缩图片降低存储成本
- 使用 CDN 加速图片加载

---

## 联系支持

遇到问题？
- 📧 Email: support@aiposter.studio
- 💬 Discord: [邀请链接]
- 📖 文档：https://docs.aiposter.studio
