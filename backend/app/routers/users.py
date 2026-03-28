from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Poster, Session as UserSession
from ..schemas import UserResponse, PosterResponse

router = APIRouter(prefix="/api/users", tags=["用户"])

@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: str = Depends(lambda x: x), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    token = authorization.replace("Bearer ", "")
    session = db.query(UserSession).filter(UserSession.access_token == token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Token expired")
    user = db.query(User).filter(User.id == session.user_id).first()
    return UserResponse.model_validate(user)

@router.get("/me/posters")
async def get_user_posters(authorization: str = Depends(lambda x: x), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    token = authorization.replace("Bearer ", "")
    session = db.query(UserSession).filter(UserSession.access_token == token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Token expired")
    posters = db.query(Poster).filter(Poster.user_id == session.user_id).all()
    return {"success": True, "posters": [PosterResponse.model_validate(p) for p in posters]}
