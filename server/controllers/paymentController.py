from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime
import os
import stripe

from database import db

stripe.api_key = os.getenv("STRIPE_SECRET_KEY") or os.getenv("STRIPE_KEY")


def _generate_order_id() -> str:
    return f"ORD-{str(ObjectId())[-8:].upper()}"


def _build_order_document(data: dict) -> dict:
    shipping_address = data.get("shippingAddress") or {}
    billing_address = data.get("billingAddress") or None

    contact_details = {
        "firstName": shipping_address.get("firstName"),
        "lastName": shipping_address.get("lastName"),
        "email": shipping_address.get("email"),
        "phone": shipping_address.get("phone"),
    }

    return {
        "orderId": data.get("orderId") or _generate_order_id(),
        "user": None,
        "guestId": data.get("guestId"),
        "orderItems": data.get("orderItems", []),
        "contactDetails": contact_details,
        "shippingAddress": shipping_address,
        "billingAddress": billing_address,
        "paymentMethod": data.get("paymentMethod"),
        "paymentResult": None,
        "itemsPrice": float(data.get("itemsPrice", 0) or 0),
        "taxPrice": float(data.get("taxPrice", 0) or 0),
        "shippingPrice": float(data.get("shippingPrice", 0) or 0),
        "totalPrice": float(data.get("totalAmount", 0) or 0),
        "couponCode": data.get("couponCode"),
        "discountAmount": float(data.get("discountAmount", 0) or 0),
        "isPaid": False,
        "paidAt": None,
        "isDelivered": False,
        "deliveredAt": None,
        "status": "pending",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }


async def create_payment_intent(data: dict):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe is not configured on the server.")

    amount = float(data.get("totalAmount", 0) or 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid payment amount.")

    orders_coll = db.get_collection("orders")
    order_doc = _build_order_document(data)
    insert_result = orders_coll.insert_one(order_doc)

    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=int(round(amount * 100)),
            currency="gbp",
            automatic_payment_methods={"enabled": True},
            metadata={
                "orderId": order_doc["orderId"],
                "mongoId": str(insert_result.inserted_id),
                "couponCode": order_doc.get("couponCode") or "",
            },
        )

        orders_coll.update_one(
            {"_id": insert_result.inserted_id},
            {
                "$set": {
                    "paymentIntentId": payment_intent.id,
                    "updatedAt": datetime.utcnow(),
                }
            },
        )

        return {
            "clientSecret": payment_intent.client_secret,
            "orderId": order_doc["orderId"],
        }
    except Exception as e:
        orders_coll.delete_one({"_id": insert_result.inserted_id})
        raise HTTPException(status_code=500, detail=str(e))


async def create_checkout_session(data: dict):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe is not configured on the server.")

    order_items = data.get("orderItems", [])
    if not isinstance(order_items, list) or not order_items:
        raise HTTPException(status_code=400, detail="Order items are required.")

    orders_coll = db.get_collection("orders")
    order_doc = _build_order_document(data)
    insert_result = orders_coll.insert_one(order_doc)

    try:
        line_items = []
        for item in order_items:
            price = float(item.get("price", 0) or 0)
            qty = int(item.get("qty", 1) or 1)
            line_items.append(
                {
                    "price_data": {
                        "currency": "gbp",
                        "product_data": {
                            "name": item.get("name") or "Product",
                        },
                        "unit_amount": int(round(price * 100)),
                    },
                    "quantity": qty,
                }
            )

        app_base = os.getenv("CLIENT_URL") or "http://localhost:5173"
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{app_base}/order/{order_doc['orderId']}",
            cancel_url=f"{app_base}/checkout",
            metadata={
                "orderId": order_doc["orderId"],
                "mongoId": str(insert_result.inserted_id),
            },
        )

        orders_coll.update_one(
            {"_id": insert_result.inserted_id},
            {
                "$set": {
                    "checkoutSessionId": session.id,
                    "updatedAt": datetime.utcnow(),
                }
            },
        )

        return {
            "url": session.url,
            "orderId": order_doc["orderId"],
        }
    except Exception as e:
        orders_coll.delete_one({"_id": insert_result.inserted_id})
        raise HTTPException(status_code=500, detail=str(e))
