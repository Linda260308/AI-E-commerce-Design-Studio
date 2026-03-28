from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    credits: int = 5
    plan: str = "free"
    created_at: datetime
    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    success: bool
    user: UserResponse
    access_token: str
    refresh_token: str
    expires_at: str

class GoogleAuthUrlResponse(BaseModel):
    authorization_url: str
    state: str

class PosterResponse(BaseModel):
    id: str
    user_id: str
    prompt: Optional[str]
    image_url: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
