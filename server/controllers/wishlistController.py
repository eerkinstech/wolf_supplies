from fastapi import APIRouter, HTTPException, Depends
from models.wishlist import Wishlist
from models.product import Product
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class WishlistItem(BaseModel):
    product: str
    snapshot: Optional[dict] = None
    addedAt: str

class WishlistResponse(BaseModel):
    items: List[WishlistItem]

@router.get("/wishlist", response_model=WishlistResponse)
async def get_wishlist(guest_id: Optional[str] = None, user_id: Optional[str] = None):
    query = {}
    if user_id:
        query = {"user": user_id}
    elif guest_id:
        query = {"guestId": guest_id}

    wishlist = await Wishlist.find_one(query).populate("items.product")
    if not wishlist:
        return {"items": []}

    items = [
        {
            "product": item.product,
            "snapshot": item.snapshot or None,
            "addedAt": item.addedAt,
        }
        for item in wishlist.items
    ]

    return {"items": items}

