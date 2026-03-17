from fastapi import APIRouter, Depends, Body, HTTPException, Request, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from middleware.auth_middleware import get_user_by_id
from database import db
from bson import ObjectId
from typing import Optional
from jose import jwt, JWTError
import uuid
from datetime import datetime

router = APIRouter()
security = HTTPBearer(auto_error=False)

# Helper to get or generate guest ID
def get_guest_id_from_request(request: Request) -> str:
    guest_id = request.cookies.get("guest_id")
    if not guest_id:
        guest_id = str(uuid.uuid4())
    return guest_id

# Optional auth - returns None if no valid token
def optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Optional[dict]:
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, "eerkinstech", algorithms=["HS256"])
        user_id = payload.get("id")
        if not user_id:
            return None
        # For sync code, just return the decoded user info
        return {"id": user_id}
    except JWTError:
        return None
    except Exception:
        return None

# GET /api/wishlist - Fetch current wishlist
@router.get("/")
def fetch_wishlist(request: Request, user: Optional[dict] = Depends(optional_auth)):
    try:
        wishlists_coll = db.get_collection("wishlists")
        wishlist = None
        
        if user:
            user_id = user.get("id")
            wishlist = wishlists_coll.find_one({"user": user_id})
        else:
            guest_id = get_guest_id_from_request(request)
            wishlist = wishlists_coll.find_one({"guest_id": guest_id})

        items = []
        if wishlist:
            items = wishlist.get("items", [])
            if "_id" in wishlist:
                del wishlist["_id"]

        return {
            "success": True,
            "items": items,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching wishlist: {str(e)}")

# POST /api/wishlist - Add item to wishlist
@router.post("/")
def add_to_wishlist_endpoint(request: Request, data: dict = Body(...), user: Optional[dict] = Depends(optional_auth)):
    try:
        product_id = data.get("product") or data.get("productId")
        if not product_id:
            raise HTTPException(status_code=400, detail="Product ID is required")

        wishlists_coll = db.get_collection("wishlists")

        if user:
            user_id = user.get("id")
            query = {"user": user_id}
        else:
            guest_id = get_guest_id_from_request(request)
            query = {"guest_id": guest_id}

        wishlist = wishlists_coll.find_one(query)
        current_items = wishlist.get("items", []) if wishlist else []

        # Check if item already in wishlist
        existing = next(
            (item for item in current_items if str(item.get("product")) == str(product_id)),
            None
        )

        if not existing:
            new_item = {"product": product_id, "addedAt": datetime.utcnow().isoformat()}
            wishlists_coll.update_one(
                query,
                {"$push": {"items": new_item}},
                upsert=True
            )

        # Fetch updated wishlist
        updated = wishlists_coll.find_one(query)
        items = updated.get("items", []) if updated else (current_items if existing else [])

        return {
            "success": True,
            "message": "Added to wishlist",
            "items": items
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to wishlist: {str(e)}")

# DELETE /api/wishlist/{item_id} - Remove item from wishlist
@router.delete("/{item_id}")
def remove_from_wishlist_endpoint(item_id: str, request: Request, user: Optional[dict] = Depends(optional_auth)):
    try:
        wishlists_coll = db.get_collection("wishlists")

        if user:
            query = {"user": user.get("id")}
        else:
            guest_id = get_guest_id_from_request(request)
            query = {"guest_id": guest_id}

        # Remove the item whose product field matches item_id
        wishlists_coll.update_one(
            query,
            {"$pull": {"items": {"product": item_id}}}
        )

        updated = wishlists_coll.find_one(query)
        items = updated.get("items", []) if updated else []

        return {
            "success": True,
            "message": "Removed from wishlist",
            "items": items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing from wishlist: {str(e)}")