from fastapi import APIRouter, HTTPException, Depends
from models.order import Order
from models.coupon import Coupon
from utils.email_service import send_order_confirmation_email, send_order_notification_to_admin, send_order_with_pdf
from utils.pdf_generator import generate_order_pdf
from pydantic import BaseModel
from typing import Optional
import stripe
import os

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY") or os.getenv("STRIPE_KEY")

class CheckoutSessionRequest(BaseModel):
    orderItems: list
    shippingAddress: dict
    billingAddress: dict
    paymentMethod: str
    itemsPrice: float

@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutSessionRequest):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe is not configured on the server.")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Sample Product',
                        },
                        'unit_amount': 2000,
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url='https://example.com/success',
            cancel_url='https://example.com/cancel',
        )
        return {"id": session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

