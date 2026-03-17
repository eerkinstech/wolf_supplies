from fastapi import APIRouter, Depends, HTTPException
from controllers.order_controller import (
    create_order,
    get_all_orders,
    get_order_by_id,
    update_order_status,
    update_fulfillment_status,
    update_delivery_status,
    update_payment_status,
    delete_order
)
from middleware.auth_middleware import protect, admin

router = APIRouter()

def check_order_permission(user: dict):
    """Check if user can manage orders"""
    is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
    if is_admin:
        return True
    custom_role = user.get("customRole")
    if custom_role and isinstance(custom_role, dict):
        permissions = custom_role.get("permissions", [])
        permission_ids = [p if isinstance(p, str) else p.get("id") or p.get("name") for p in permissions]
        return "orders" in permission_ids
    return False

@router.post("/")
async def add_order(data: dict, user=Depends(protect)):
    return await create_order(data, user)

@router.get("/")
async def fetch_orders(user=Depends(protect)):
    return await get_all_orders()

@router.get("/{order_id}")
async def fetch_order_by_id(order_id: str, user=Depends(protect)):
    return await get_order_by_id(order_id, user)

@router.put("/{order_id}")
async def modify_order_status(order_id: str, data: dict, user=Depends(protect)):
    if not check_order_permission(user):
        raise HTTPException(403, "Not authorized. Admin access required")
    return await update_order_status(order_id, data, user)

@router.put("/{order_id}/fulfillment")
async def modify_fulfillment_status(order_id: str, data: dict, user=Depends(protect)):
    if not check_order_permission(user):
        raise HTTPException(403, "Not authorized. Admin access required")
    return await update_fulfillment_status(order_id, data, user)

@router.put("/{order_id}/delivery")
async def modify_delivery_status(order_id: str, data: dict, user=Depends(protect)):
    if not check_order_permission(user):
        raise HTTPException(403, "Not authorized. Admin access required")
    return await update_delivery_status(order_id, data, user)

@router.put("/{order_id}/payment")
async def modify_payment_status(order_id: str, data: dict, user=Depends(protect)):
    if not check_order_permission(user):
        raise HTTPException(403, "Not authorized. Admin access required")
    return await update_payment_status(order_id, data, user)

@router.delete("/{order_id}")
async def remove_order(order_id: str, user=Depends(protect)):
    if not check_order_permission(user):
        raise HTTPException(403, "Not authorized. Admin access required")
    return await delete_order(order_id, user)