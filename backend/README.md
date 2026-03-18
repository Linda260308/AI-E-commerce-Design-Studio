# 后端 API 服务

基于 FastAPI 的 AI 电商海报生成后端服务

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填入你的配置
# QWEN_API_KEY 已配置为测试密钥
```

### 3. 启动服务

```bash
# 开发模式（自动重载）
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 或生产模式
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

访问 http://localhost:8000 查看 API 文档

## API 端点

### 核心功能

#### POST /api/generate
生成 AI 海报

**请求体：**
```json
{
  "image": "data:image/png;base64,...",
  "prompt": "professional studio background",
  "text_layers": [
    {
      "text": "限时特价！",
      "x": 50,
      "y": 50,
      "fontSize": 48,
      "fontFamily": "Inter",
      "color": "#8B5CF6"
    }
  ],
  "font_style": "modern",
  "color_scheme": "#8B5CF6",
  "size": "1024x1024"
}
```

**响应：**
```json
{
  "success": true,
  "image_url": "https://...",
  "generation_id": "gen_xxx",
  "text_editable": true
}
```

#### POST /api/remove-background
去除图片背景

**请求：**
- `file`: UploadFile (图片文件)

**响应：**
```json
{
  "success": true,
  "image_base64": "data:image/png;base64,..."
}
```

#### POST /api/upload
上传图片

**请求：**
- `file`: UploadFile

**响应：**
```json
{
  "success": true,
  "url": "https://...",
  "filename": "product.jpg",
  "size": 123456
}
```

### 用户相关

#### GET /api/user/{user_id}/usage
获取用户使用额度

**响应：**
```json
{
  "user_id": "user_123",
  "generations_used": 3,
  "generations_limit": 50,
  "plan": "pro",
  "reset_date": "2026-04-01"
}
```

### 支付相关

#### POST /api/payment/create
创建 PayPal 支付会话

**请求体：**
```json
{
  "user_id": "user_123",
  "plan": "monthly"
}
```

## 技术栈

- **框架**: FastAPI
- **AI 服务**: Qwen-image-2.0 (阿里云 DashScope)
- **数据库**: PostgreSQL + SQLAlchemy
- **缓存**: Redis
- **存储**: CloudFlare R2 (兼容 S3)
- **支付**: PayPal
- **图像处理**: Pillow, rembg

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 主应用
│   ├── api/                 # API 路由
│   │   ├── __init__.py
│   │   ├── generate.py      # 生成接口
│   │   ├── upload.py        # 上传接口
│   │   └── payment.py       # 支付接口
│   ├── models/              # 数据库模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── order.py
│   ├── services/            # 业务逻辑
│   │   ├── __init__.py
│   │   ├── qwen_service.py  # Qwen AI 服务
│   │   └── payment_service.py
│   └── utils/               # 工具函数
│       ├── __init__.py
│       └── auth.py
├── tests/                   # 测试文件
├── .env                     # 环境变量
├── .env.example             # 环境变量示例
├── requirements.txt         # Python 依赖
└── README.md                # 本文档
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| QWEN_API_KEY | 阿里云 Qwen API 密钥 | - |
| DATABASE_URL | PostgreSQL 连接字符串 | - |
| REDIS_URL | Redis 连接字符串 | redis://localhost:6379 |
| R2_BUCKET_NAME | CloudFlare R2 桶名 | - |
| PAYPAL_CLIENT_ID | PayPal 客户端 ID | - |
| JWT_SECRET | JWT 密钥 | - |
| APP_ENV | 环境 (development/production) | development |
| DEBUG | 调试模式 | True |

## 开发指南

### 添加新的 API 端点

1. 在 `app/api/` 创建新的路由文件
2. 在 `app/main.py` 中注册路由
3. 编写测试用例
4. 更新 API 文档

### 数据库迁移

```bash
# 初始化 Alembic
alembic init alembic

# 创建迁移
alembic revision --autogenerate -m "Initial migration"

# 应用迁移
alembic upgrade head
```

### 测试

```bash
# 运行所有测试
pytest

# 运行特定测试
pytest tests/test_generate.py

# 带覆盖率报告
pytest --cov=app
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t ai-poster-backend .

# 运行容器
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  ai-poster-backend
```

### 生产环境

1. 设置 `APP_ENV=production`
2. 配置 HTTPS
3. 使用 Gunicorn + Uvicorn
4. 启用 Redis 缓存
5. 配置日志收集

```bash
gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

## 故障排查

### Qwen API 调用失败

1. 检查 API 密钥是否正确
2. 确认账户有足够额度
3. 查看 API 文档确认请求格式
4. 检查网络连接

### 数据库连接失败

1. 确认 PostgreSQL 服务运行
2. 检查 DATABASE_URL 格式
3. 验证用户名密码
4. 确认数据库已创建

### 图片上传失败

1. 检查文件大小限制
2. 确认存储桶权限
3. 查看 CORS 配置
4. 验证文件类型

## 性能优化

- 启用 Redis 缓存生成结果
- 使用 CDN 分发图片
- 实现图片压缩
- 添加请求限流
- 使用异步任务队列处理耗时操作

## 安全建议

- ✅ 使用 HTTPS
- ✅ 启用 CORS 限制
- ✅ 设置强 JWT_SECRET
- ✅ 实现 API 限流
- ✅ 验证用户输入
- ✅ 定期轮换 API 密钥

## 联系支持

遇到问题？
- 📧 Email: support@aiposter.studio
- 📖 文档：https://docs.aiposter.studio
- 💬 Discord: [邀请链接]
