from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import base64
from dotenv import load_dotenv
from sqlalchemy.orm import Session

load_dotenv()

# 导入数据库
from app.database import engine, get_db, Base
from app.models import User, Poster, Session as UserSession

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 导入 Qwen 服务
from app.services.qwen_service import QwenImageService

# 导入路由
from app.routers import auth, users

app = FastAPI(
    title="AI E-commerce Design Studio API",
    description="API for AI-powered e-commerce poster generation using Qwen-image-2.0",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-poster-studio.vercel.app",
        "https://ai-poster-studio-git-main-linda260308s-projects.vercel.app",
        "https://ai-poster-studio-backend.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(users.router)

# 初始化 Qwen 服务
QWEN_API_KEY = os.getenv("QWEN_API_KEY")
qwen_service = QwenImageService(QWEN_API_KEY)

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
    image_base64: Optional[str] = None
    generation_id: str
    text_editable: bool = True
    error: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "AI E-commerce Design Studio API",
        "version": "1.0.0",
        "status": "running",
        "ai_provider": "Qwen-image-2.0 (Alibaba Cloud)",
        "auth": "Google OAuth 2.0 enabled"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/generate", response_model=PosterGenerationResponse)
async def generate_poster(request: PosterGenerationRequest, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    try:
        user = None
        if authorization:
            try:
                from app.routers.users import get_current_user_from_token
                user = get_current_user_from_token(authorization, db)
            except:
                pass
        
        text_content = ""
        if request.text_layers and len(request.text_layers) > 0:
            text_content = request.text_layers[0].text
        
        result = await qwen_service.generate_poster(
            image_base64=request.image if request.image.startswith("data:") else "",
            prompt=request.prompt,
            text_content=text_content,
            font_style=request.font_style,
            color_scheme=request.color_scheme,
            size=request.size
        )
        
        if result["success"]:
            poster_id = None
            if user:
                import secrets
                poster_id = f"poster_{secrets.token_hex(16)}"
                poster = Poster(
                    id=poster_id,
                    user_id=user.id,
                    prompt=request.prompt,
                    image_url=result.get("image_url"),
                    font_style=request.font_style,
                    color_scheme=request.color_scheme,
                    size=request.size,
                    credits_used=1
                )
                db.add(poster)
                db.commit()
            
            return PosterGenerationResponse(
                success=True,
                image_url=result.get("image_url"),
                generation_id=poster_id or f"gen_{os.urandom(8).hex()}",
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
    try:
        image_data = await file.read()
        image_base64 = base64.b64encode(image_data).decode()
        result = await qwen_service.remove_background(image_base64)
        if result["success"]:
            return {"success": True, "image_base64": f"data:image/png;base64,{result['image_base64']}"}
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "抠图失败"))
    except HTTPException:
        raise
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
