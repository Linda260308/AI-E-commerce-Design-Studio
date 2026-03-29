from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    email_verified = Column(Boolean, default=False)
    credits = Column(Integer, default=5)
    plan = Column(String, default="free")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    posters = relationship("Poster", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    access_token = Column(String, unique=True, index=True)
    refresh_token = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="sessions")

class Poster(Base):
    __tablename__ = "posters"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=True)
    prompt = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    font_style = Column(String, default="modern")
    color_scheme = Column(String, default="#8B5CF6")
    size = Column(String, default="1024x1024")
    credits_used = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="posters")

import secrets

class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    id = Column(String, primary_key=True, index=True, default=lambda: f"oauth_{secrets.token_hex(16)}")
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String, default="google")
    provider_account_id = Column(String, unique=True, index=True)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    expires_at = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
