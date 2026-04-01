from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import secrets
import json
import httpx
from datetime import datetime, timedelta
import base64

from ..database import get_db
from ..models import User, PaymentOrder, CreditTransaction, Subscription
from ..schemas import (
    PaymentOrderCreate, PaymentOrderResponse,
    PayPalOrderResponse, AlipayQrResponse
)

router = APIRouter(prefix="/api/payment", tags=["支付"])

# 配置
PAYPAL_CLIENT_ID = "AQkquBDf1zctJOWGKWUEtKXm6qVfqUE7t8zDvWvJzrKj8Jvz8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z"  # 测试环境
PAYPAL_CLIENT_SECRET = "EHbZ9vP8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8"  # 测试环境
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"  # 生产环境：https://api-m.paypal.com



# Product pricing configuration (in cents)
PRODUCTS = {
    "pro_monthly": {"amount": 1900, "currency": "USD", "credits": 150, "months": 1, "name": "Pro Monthly"},
    "pro_annual": {"amount": 19900, "currency": "USD", "credits": 150, "months": 12, "name": "Pro Annual"},
    "credits_100": {"amount": 999, "currency": "USD", "credits": 100, "months": 0, "name": "100 Credits"},
    "credits_500": {"amount": 3999, "currency": "USD", "credits": 500, "months": 0, "name": "500 Credits"},
}

# 依赖项：获取当前登录用户
def get_current_user(authorization: str = Depends(lambda x: x), db: Session = Depends(get_db)):
    from ..routers.users import get_current_user as auth_get_user
    return auth_get_user(authorization, db)

# ==================== 创建订单 ====================

@router.post("/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(
    order: PaymentOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create payment order"""
    if order.product_id not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid product")
    
    product = PRODUCTS[order.product_id]
    
    if order.payment_method not in ["paypal"]:
        raise HTTPException(status_code=400, detail="Unsupported payment method. Currently only PayPal is supported.")
    
    # Generate order number
    order_no = f"ORD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{secrets.token_hex(4)}"
    
    # Create order record
    payment_order = PaymentOrder(
        user_id=current_user.id,
        order_no=order_no,
        product_type=order.product_type,
        product_id=order.product_id,
        amount=product["amount"],
        currency=product["currency"],
        payment_method=order.payment_method,
        credits_amount=product["credits"],
        subscription_months=product["months"]
    )
    db.add(payment_order)
    db.commit()
    db.refresh(payment_order)
    
    # Create PayPal order
    if order.payment_method == "paypal":
        paypal_data = await create_paypal_order(payment_order, product)
        payment_order.paypal_order_id = paypal_data["order_id"]
        db.commit()
        return PaymentOrderResponse(
            **payment_order.__dict__,
            paypal_order_id=paypal_data["order_id"],
            alipay_url=paypal_data.get("approve_url")
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid payment method")

# ==================== PayPal 支付 ====================

async def create_paypal_order(payment_order: PaymentOrder, product: dict) -> dict:
    """Create PayPal order"""
    auth = base64.b64encode(f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}".encode()).decode()
    
    order_data = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "reference_id": payment_order.order_no,
            "amount": {
                "currency_code": product["currency"],
                "value": str(product["amount"] / 100)
            },
            "description": product["name"]
        }]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Basic {auth}"
            },
            json=order_data
        )
        
        if response.status_code != 201:
            raise HTTPException(status_code=500, detail="Failed to create PayPal order")
        
        data = response.json()
        approve_url = None
        for link in data.get("links", []):
            if link.get("rel") == "approve":
                approve_url = link.get("href")
                break
        
        return {
            "order_id": data["id"],
            "approve_url": approve_url,
            "status": data["status"]
        }

@router.post("/paypal/capture")
async def capture_paypal_order(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Capture PayPal payment"""
    data = await request.json()
    order_id = data.get("orderID")
    
    if not order_id:
        raise HTTPException(status_code=400, detail="Missing orderID")
    
    # Find order
    payment_order = db.query(PaymentOrder).filter(
        PaymentOrder.paypal_order_id == order_id,
        PaymentOrder.user_id == current_user.id
    ).first()
    
    if not payment_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if payment_order.status == "paid":
        return {"success": True, "message": "Already paid"}
    
    # Call PayPal API to capture payment
    auth = base64.b64encode(f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}".encode()).decode()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Basic {auth}"
            }
        )
        
        if response.status_code != 201:
            payment_order.status = "failed"
            db.commit()
            raise HTTPException(status_code=500, detail="Payment capture failed")
        
        capture_data = response.json()
        
        # Update order status
        payment_order.status = "paid"
        payment_order.paid_at = datetime.utcnow()
        payment_order.paypal_order_id = capture_data["id"]
        
        # Fulfill order (add credits/subscription)
        await fulfill_order(payment_order, current_user, db)
        
        db.commit()
        
        return {"success": True, "credits": current_user.credits}



# ==================== Order Fulfillment ====================

async def fulfill_order(payment_order: PaymentOrder, user: User, db: Session):
    """Fulfill order: add credits or subscription"""
    # Add credits
    if payment_order.credits_amount > 0:
        user.credits += payment_order.credits_amount
        
        txn = CreditTransaction(
            user_id=user.id,
            amount=payment_order.credits_amount,
            type="purchase",
            description=f"Purchase {payment_order.product_id}"
        )
        db.add(txn)
    
    # Activate subscription
    if payment_order.subscription_months > 0:
        # Cancel old subscription
        db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).update({"status": "expired"})
        
        # Create new subscription
        subscription = Subscription(
            user_id=user.id,
            plan_type="pro",
            status="active",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30 * payment_order.subscription_months)
        )
        db.add(subscription)
        user.plan = "pro"

# ==================== 查询订单状态 ====================

@router.get("/order/{order_no}", response_model=PaymentOrderResponse)
async def get_order_status(
    order_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """查询订单状态"""
    payment_order = db.query(PaymentOrder).filter(
        PaymentOrder.order_no == order_no,
        PaymentOrder.user_id == current_user.id
    ).first()
    
    if not payment_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return payment_order

@router.get("/orders", response_model=list)
async def get_user_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户订单列表"""
    orders = db.query(PaymentOrder).filter(
        PaymentOrder.user_id == current_user.id
    ).order_by(PaymentOrder.created_at.desc()).offset(skip).limit(limit).all()
    
    return orders
