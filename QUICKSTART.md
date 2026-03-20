# 快速启动指南 🚀

## 前端开发

### 1. 安装依赖

```bash
cd /root/.openclaw/workspace/project/AI-poster-studio/frontend
npm install
```

### 2. 配置环境变量

`.env.local` 已配置好阿里云 API Key：
```bash
DASHSCOPE_API_KEY=sk-46c536ffaf7140679d76a35016d9a488
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 后端开发

### 1. 安装依赖

```bash
cd /root/.openclaw/workspace/project/AI-poster-studio/backend
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cd backend
cp .env.example .env
nano .env
```

填写以下配置：
```bash
# 阿里云 DashScope
QWEN_API_KEY=sk-46c536ffaf7140679d76a35016d9a488

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/ai_poster_studio

# Redis
REDIS_URL=redis://localhost:6379
```

### 3. 启动后端服务

```bash
cd backend
python -m uvicorn app.main:app --reload
```

访问 http://localhost:8000/docs 查看 API 文档

---

## 核心功能

### MVP 已实现功能 ✅

1. **Landing Page**
   - 完整的产品介绍页面
   - 功能展示、价格表、案例演示
   - 响应式设计

2. **编辑器核心功能**
   - ✅ 图片上传（拖拽/点击）
   - ✅ 尺寸选择（Amazon、Shopify、Facebook 等）
   - ✅ AI 背景生成（阿里云 qwen-image-2.0）
   - ✅ 文字编辑（添加、修改、拖拽、样式调整）
   - ✅ 画布预览（react-konva）
   - ✅ 图片导出

3. **状态管理**
   - Zustand 全局状态
   - credits 计数
   - 订阅计划管理

4. **API 集成**
   - 阿里云 DashScope 图片生成
   - Next.js API Routes

---

## 下一步开发计划

### Phase 1 (本周)
- [ ] 用户注册/登录系统
- [ ] 数据库集成（用户表、生成记录）
- [ ] 生成历史记录功能

### Phase 2 (下周)
- [ ] PayPal 支付集成
- [ ] 订阅管理系统
- [ ] 用量统计和限制

### Phase 3
- [ ] 批量处理功能
- [ ] 更多字体和样式
- [ ] 模板库

---

## 常见问题

### Q: 图片生成失败？
A: 检查阿里云 API Key 是否有效，确保有足够的额度。

### Q: 前端无法连接后端？
A: 确保后端服务已启动，检查 `.env.local` 中的 `NEXT_PUBLIC_API_URL` 配置。

### Q: 图片上传失败？
A: 检查图片格式（支持 JPG/PNG/WEBP）和大小（≤20MB）。

---

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **状态管理**: Zustand
- **图片编辑**: react-konva
- **图片上传**: react-dropzone
- **AI 生成**: 阿里云 qwen-image-2.0
- **后端**: FastAPI (Python)
- **数据库**: PostgreSQL
- **缓存**: Redis

---

**仓库**: https://github.com/Linda260308/AI-poster-studio  
**文档**: /docs/ROADMAP.md
