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

class UserStats(BaseModel):
    total_posters: int
    total_credits_used: int
    last_login_at: Optional[datetime]

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None

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
    title: Optional[str] = None
    prompt: Optional[str]
    image_url: Optional[str]
    font_style: Optional[str]
    color_scheme: Optional[str]
    size: Optional[str]
    credits_used: int
    created_at: datetime
    class Config:
        from_attributes = True

class PosterCreate(BaseModel):
    title: Optional[str] = None
    prompt: Optional[str]
    image_url: Optional[str] = None
    font_style: Optional[str] = "modern"
    color_scheme: Optional[str] = "#8B5CF6"
    size: Optional[str] = "1024x1024"
    credits_used: int = 1

class PosterUpdate(BaseModel):
    title: Optional[str] = None
    prompt: Optional[str] = None

class CreditTransactionResponse(BaseModel):
    id: str
    amount: int
    type: str
    description: Optional[str]
    poster_id: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class SubscriptionResponse(BaseModel):
    id: str
    plan_type: str
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    class Config:
        from_attributes = True

class SubscriptionUpgrade(BaseModel):
    plan_type: str  # pro/enterprise
    payment_method: str  # stripe/wechat
