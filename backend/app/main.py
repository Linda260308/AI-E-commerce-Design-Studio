from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import aiohttp
import os
import base64
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 导入 Qwen 服务
from app.services.qwen_service import QwenImageService

app = FastAPI(
    title="AI E-commerce Design Studio API",
    description="API for AI-powered e-commerce poster generation using Qwen-image-2.0",
    version="1.0.0"
)

# CORS middleware - 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-domain.com",
        "https://ai-poster-studio.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 Qwen 服务
QWEN_API_KEY = os.getenv("QWEN_API_KEY", "sk-46c536ffaf7140679d76a35016d9a488")
qwen_service = QwenImageService(QWEN_API_KEY)

# ============ 数据模型 ============

class TextLayer(BaseModel):
    id: str
    text: str
    x: float
    y: float
    fontSize: float
    fontFamily: str
    fontWeight: str
    fontStyle: str
    color: str
    textAlign: str
    rotation: float
    opacity: float

class PosterGenerationRequest(BaseModel):
    image: str  # base64 或 URL
    prompt: str
    text_layers: Optional[List[TextLayer]] = []
    font_style: Optional[str] = "modern"
    color_scheme: Optional[str] = "#8B5CF6"
    size: Optional[str] = "1024x1024"

class PosterGenerationResponse(BaseModel):
    success: bool
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    generation_id: str
    text_editable: bool = True
    error: Optional[str] = None

class PaymentRequest(BaseModel):
    user_id: str
    plan: str  # "monthly" or "annual"

class PaymentResponse(BaseModel):
    success: bool
    payment_url: str
    session_id: str

# ============ 健康检查 ============

@app.get("/")
async def root():
    return {
        "message": "AI E-commerce Design Studio API",
        "version": "1.0.0",
        "status": "running",
        "ai_provider": "Qwen-image-2.0 (Alibaba Cloud)"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ============ 核心 API 路由 ============

@app.post("/api/generate", response_model=PosterGenerationResponse)
async def generate_poster(request: PosterGenerationRequest):
    """
    使用 Qwen-image-2.0 生成电商海报
    
    功能：
    - 上传产品图片
    - AI 生成专业背景
    - 添加可编辑文字
    - 返回高清海报
    """
    try:
        # 提取主要文字内容（从第一个文字图层）
        text_content = ""
        if request.text_layers and len(request.text_layers) > 0:
            text_content = request.text_layers[0].text
        
        # 调用 Qwen 服务生成海报
        result = await qwen_service.generate_poster(
            image_base64=request.image if request.image.startswith("data:") else "",
            prompt=request.prompt,
            text_content=text_content,
            font_style=request.font_style,
            color_scheme=request.color_scheme,
            size=request.size
        )
        
        if result["success"]:
            return PosterGenerationResponse(
                success=True,
                image_url=result.get("image_url"),
                generation_id=result.get("generation_id", f"gen_{os.urandom(8).hex()}"),
                text_editable=True
            )
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "生成失败"))
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/remove-background")
async def remove_background(file: UploadFile = File(...)):
    """
    去除产品图片背景
    
    使用：
    - 阿里云图像分割服务（优先）
    - rembg 本地服务（备用）
    """
    try:
        # 读取上传的文件
        image_data = await file.read()
        image_base64 = base64.b64encode(image_data).decode()
        
        # 调用 Qwen 服务去除背景
        result = await qwen_service.remove_background(image_base64)
        
        if result["success"]:
            return {
                "success": True,
                "image_base64": f"data:image/png;base64,{result['image_base64']}"
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "抠图失败"))
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    上传图片到云存储（CloudFlare R2 或本地）
    
    返回：
    - 图片 URL
    - 或 base64 编码
    """
    try:
        # 读取文件
        image_data = await file.read()
        
        # 在生产环境中，这里应该上传到 CloudFlare R2
        # 现在返回 base64
        image_base64 = base64.b64encode(image_data).decode()
        
        return {
            "success": True,
            "url": f"data:image/{file.content_type.split('/')[-1]};base64,{image_base64}",
            "filename": file.filename,
            "size": len(image_data)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ 支付相关 ============

@app.post("/api/payment/create", response_model=PaymentResponse)
async def create_payment(request: PaymentRequest):
    """
    创建 PayPal 支付会话
    
    TODO: 集成真实的 PayPal API
    """
    try:
        # 这里是示例，实际应该调用 PayPal API
        return PaymentResponse(
            success=True,
            payment_url="https://www.paypal.com/checkout",
            session_id=f"payment_{os.urandom(8).hex()}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/{user_id}/usage")
async def get_user_usage(user_id: str):
    """
    获取用户使用额度
    
    返回：
    - 已使用次数
    - 剩余额度
    - 套餐类型
    """
    # TODO: 从数据库查询
    return {
        "user_id": user_id,
        "generations_used": 3,
        "generations_limit": 50,
        "plan": "pro",
        "reset_date": "2026-04-01"
    }

# ============ 错误处理 ============

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "success": False,
        "error": exc.detail
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return {
        "success": False,
        "error": f"服务器内部错误：{str(exc)}"
    }

# ============ 启动服务 ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )
