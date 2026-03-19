from fastapi import APIRouter, Body, HTTPException
from controllers.paymentController import create_checkout_session, create_payment_intent

router = APIRouter()


@router.post("/create-checkout-session")
async def create_checkout_session_route(body: dict = Body(...)):
    try:
        return await create_checkout_session(body)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-payment-intent")
async def create_payment_intent_route(body: dict = Body(...)):
    try:
        return await create_payment_intent(body)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
