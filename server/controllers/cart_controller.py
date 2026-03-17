from fastapi import HTTPException, Depends
from server.models.cart import Cart
from server.models.event_log import EventLog
from server.middleware.auth_middleware import get_guest_id, get_user
from datetime import datetime, timedelta
from typing import List

# In-memory cache to prevent duplicate cart updates within 1 second
cart_update_cache = {}
CACHE_TTL = timedelta(seconds=1)

# Helper function to manage cache
def is_duplicate_update(cache_key: str, current_content: str):
    cached_content, expiry = cart_update_cache.get(cache_key, (None, None))
    if cached_content == current_content and expiry > datetime.now():
        return True
    cart_update_cache[cache_key] = (current_content, datetime.now() + CACHE_TTL)
    return False

# GET /api/cart - get cart by guestId (or user if authenticated)
async def get_cart(user=Depends(get_user), guest_id=Depends(get_guest_id)):
    try:
        cart = None
        if user:
            cart = await Cart.find_one({"user": user.id})
        elif guest_id:
            cart = await Cart.find_one({"guest_id": guest_id})

        cart_data = {
            "_id": cart.id if cart else None,
            "user": cart.user if cart else None,
            "guest_id": cart.guest_id if cart else guest_id,
            "items": cart.items if cart else [],
            "updated_at": cart.updated_at if cart else None,
        }
        return {**cart_data, "_guest_id": guest_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cart: {str(e)}")

# POST /api/cart - update/create cart for guestId or user
async def update_cart(items: List[dict], user=Depends(get_user), guest_id=Depends(get_guest_id)):
    if not isinstance(items, list):
        raise HTTPException(status_code=400, detail="Cart items must be an array")

    cache_key = f"user-{user.id}" if user else f"guest-{guest_id}"
    current_content = str(items)

    if is_duplicate_update(cache_key, current_content):
        return {"message": "Cart already up to date", "items": items, "skipped": True}

    cart = None
    if user:
        cart = await Cart.find_one({"user": user.id}) or Cart(user=user.id, items=[])
    elif guest_id:
        cart = await Cart.find_one({"guest_id": guest_id}) or Cart(guest_id=guest_id, items=[])
    else:
        raise HTTPException(status_code=400, detail="No user identification available")

    cart.items = items
    await cart.save()
    return cart