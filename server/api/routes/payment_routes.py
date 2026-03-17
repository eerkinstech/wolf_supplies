from fastapi import APIRouter, Depends
from controllers.payment_controller import (
    initiate_payment,
    verify_payment
)
from middleware.auth_middleware import protect

router = APIRouter()

@router.post("/initiate")
async def initiate(data: dict, user=Depends(protect)):
    return await initiate_payment(data, user)

@router.post("/verify")
async def verify(data: dict, user=Depends(protect)):
    return await verify_payment(data, user)