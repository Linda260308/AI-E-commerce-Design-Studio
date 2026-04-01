from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import sys
import base64
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AI E-commerce Design Studio API",
    description="API for AI-powered e-commerce poster generation using Qwen-image-2.0",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 延迟导入数据库（避免启动时连接失败）
def get_db_engine():
    from app.database import engine, Base
    return engine, Base

# 延迟导入路由
def get_auth_router():
    from app.routers import auth
    return auth.router

def get_users_router():
    from app.routers import users
    return users.router

def get_payments_router():
    from app.routers import payments
    return payments.router

# 注册路由（延迟导入）
try:
    app.include_router(get_auth_router())
    app.include_router(get_users_router())
    app.include_router(get_payments_router())
    print("[App] Routers loaded successfully", file=sys.stderr)
except Exception as e:
    print(f"Warning: Could not load routers: {e}", file=sys.stderr)

# 初始化 Qwen 服务（可选）
QWEN_API_KEY = os.getenv("QWEN_API_KEY")
qwen_service = None
if QWEN_API_KEY:
    try:
        from app.services.qwen_service import QwenImageService
        qwen_service = QwenImageService(QWEN_API_KEY)
    except:
        pass

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
    image: str
    prompt: str
    text_layers: Optional[List[TextLayer]] = []
    font_style: Optional[str] = "modern"
    color_scheme: Optional[str] = "#8B5CF6"
    size: Optional[str] = "1024x1024"

class PosterGenerationResponse(BaseModel):
    success: bool
    image_url: Optional[str] = None
    generation_id: str
    text_editable: bool = True
    error: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "AI E-commerce Design Studio API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/generate", response_model=PosterGenerationResponse)
async def generate_poster(request: PosterGenerationRequest):
    if not qwen_service:
        raise HTTPException(status_code=500, detail="Qwen service not initialized")
    
    try:
        result = await qwen_service.generate_poster(
            image_base64=request.image if request.image.startswith("data:") else "",
            prompt=request.prompt,
            text_content=request.text_layers[0].text if request.text_layers else "",
            font_style=request.font_style,
            color_scheme=request.color_scheme,
            size=request.size
        )
        
        if result["success"]:
            return PosterGenerationResponse(
                success=True,
                image_url=result.get("image_url"),
                generation_id=f"gen_{os.urandom(8).hex()}",
                text_editable=True
            )
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "生成失败"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/remove-background")
async def remove_background(file: UploadFile = File(...)):
    if not qwen_service:
        raise HTTPException(status_code=500, detail="Qwen service not initialized")
    
    try:
        image_data = await file.read()
        image_base64 = base64.b64encode(image_data).decode()
        result = await qwen_service.remove_background(image_base64)
        
        if result["success"]:
            return {"success": True, "image_base64": f"data:image/png;base64,{result['image_base64']}"}
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "抠图失败"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        image_data = await file.read()
        image_base64 = base64.b64encode(image_data).decode()
        return {
            "success": True,
            "url": f"data:image/{file.content_type.split('/')[-1]};base64,{image_base64}",
            "filename": file.filename,
            "size": len(image_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
