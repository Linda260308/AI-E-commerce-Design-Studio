from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import aiohttp
import os

app = FastAPI(
    title="AI E-commerce Design Studio API",
    description="API for AI-powered e-commerce poster generation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PosterGenerationRequest(BaseModel):
    image_url: str
    prompt: str
    text_content: Optional[str] = None
    font_style: Optional[str] = "modern"
    color_scheme: Optional[str] = "auto"

class PosterGenerationResponse(BaseModel):
    success: bool
    image_url: str
    text_editable: bool
    generation_id: str

class PaymentRequest(BaseModel):
    user_id: str
    plan: str  # "monthly" or "annual"

class PaymentResponse(BaseModel):
    success: bool
    payment_url: str
    session_id: str

# API Routes
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
    """
    Generate a poster using AI (Nano Banana 2 or Qwen-Image-2.0)
    """
    try:
        # Call AI service (Nano Banana 2 via API 易)
        async with aiohttp.ClientSession() as session:
            # Example API call to 易 API
            payload = {
                "model": "nano-banana-2",
                "prompt": request.prompt,
                "image": request.image_url,
                "text": request.text_content,
                "style": request.font_style
            }
            
            # This is a placeholder - replace with actual API endpoint
            async with session.post(
                "https://api.apiyi.com/v1/generate",
                json=payload,
                headers={"Authorization": f"Bearer {os.getenv('APIYI_KEY')}"}
            ) as response:
                result = await response.json()
                
        return PosterGenerationResponse(
            success=True,
            image_url=result.get("image_url", ""),
            text_editable=True,
            generation_id=result.get("id", "gen_123")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/remove-background")
async def remove_background(file: UploadFile = File(...)):
    """
    Remove background from uploaded image using rembg
    """
    try:
        from rembg import remove
        from PIL import Image
        import io
        
        # Read uploaded file
        image_data = await file.read()
        input_image = Image.open(io.BytesIO(image_data))
        
        # Remove background
        output_image = remove(input_image)
        
        # Save to buffer
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG")
        output_buffer.seek(0)
        
        # In production, upload to CloudFlare R2 or S3
        # For now, return as base64
        import base64
        base64_image = base64.b64encode(output_buffer.getvalue()).decode()
        
        return {
            "success": True,
            "image_base64": f"data:image/png;base64,{base64_image}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/payment/create", response_model=PaymentResponse)
async def create_payment(request: PaymentRequest):
    """
    Create PayPal payment session
    """
    try:
        # In production, integrate with PayPal API
        # For now, return mock response
        return PaymentResponse(
            success=True,
            payment_url="https://www.paypal.com/checkout",
            session_id="payment_123"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/{user_id}/usage")
async def get_user_usage(user_id: str):
    """
    Get user's generation usage count
    """
    # Mock data - replace with database query
    return {
        "user_id": user_id,
        "generations_used": 3,
        "generations_limit": 50,
        "plan": "pro",
        "reset_date": "2026-04-01"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
