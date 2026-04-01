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

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(String, primary_key=True, index=True, default=lambda: f"sub_{secrets.token_hex(16)}")
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_type = Column(String, default="free")  # free/pro/enterprise
    status = Column(String, default="active")  # active/canceled/expired
    stripe_subscription_id = Column(String, unique=True, nullable=True)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    id = Column(String, primary_key=True, index=True, default=lambda: f"txn_{secrets.token_hex(16)}")
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)  # 正数=增加，负数=消耗
    type = Column(String, nullable=False)  # purchase/refund/consumption/bonus
    description = Column(String, nullable=True)
    poster_id = Column(String, ForeignKey("posters.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserSettings(Base):
    __tablename__ = "user_settings"
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    language = Column(String, default="zh-CN")
    theme = Column(String, default="light")
    email_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class PaymentOrder(Base):
    __tablename__ = "payment_orders"
    id = Column(String, primary_key=True, index=True, default=lambda: f"pay_{secrets.token_hex(16)}")
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_no = Column(String, unique=True, index=True, nullable=False)  # 订单号
    product_type = Column(String, nullable=False)  # subscription/credits
    product_id = Column(String, nullable=False)  # pro_monthly/pro_annual/credits_100 etc
    amount = Column(Integer, nullable=False)  # 金额（分）
    currency = Column(String, default="USD")  # USD/CNY
    payment_method = Column(String, nullable=False)  # paypal/alipay
    status = Column(String, default="pending")  # pending/paid/failed/refunded
    paypal_order_id = Column(String, unique=True, nullable=True)
    alipay_trade_no = Column(String, unique=True, nullable=True)
    alipay_out_trade_no = Column(String, unique=True, nullable=True)
    credits_amount = Column(Integer, default=0)  # 购买的 credits 数量
    subscription_months = Column(Integer, default=0)  # 订阅月数
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
