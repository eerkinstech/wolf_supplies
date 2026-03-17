from fastapi import APIRouter, Depends, Body, HTTPException, Request, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from middleware.auth_middleware import get_user_by_id
from database import db
from bson import ObjectId
from typing import Optional
from jose import jwt, JWTError
import uuid

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

# GET /api/cart - Fetch current cart
@router.get("/")
def fetch_cart(request: Request, user: Optional[dict] = Depends(optional_auth)):
    try:
        carts_coll = db.get_collection("carts")
        cart = None
        
        if user:
            user_id = user.get("id")
            cart = carts_coll.find_one({"user": user_id})
        else:
            guest_id = get_guest_id_from_request(request)
            cart = carts_coll.find_one({"guest_id": guest_id})

        items = []
        if cart:
            items = cart.get("items", [])
            # Remove MongoDB _id from response
            if "_id" in cart:
                del cart["_id"]

        return {
            "success": True,
            "items": items,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cart: {str(e)}")

# POST /api/cart - Update/sync cart items
@router.post("/")
def update_cart_items(request: Request, data: dict = Body(...), user: Optional[dict] = Depends(optional_auth)):
    try:
        items = data.get("items", [])
        if not isinstance(items, list):
            raise HTTPException(status_code=400, detail="Items must be an array")

        carts_coll = db.get_collection("carts")
        
        if user:
            user_id = user.get("id")
            query = {"user": user_id}
        else:
            guest_id = get_guest_id_from_request(request)
            query = {"guest_id": guest_id}

        # Update or create cart
        result = carts_coll.update_one(
            query,
            {"$set": {"items": items}},
            upsert=True
        )

        # Fetch updated cart
        cart = carts_coll.find_one(query)
        if cart:
            del cart["_id"]

        return {
            "success": True,
            "items": cart.get("items", []) if cart else items,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating cart: {str(e)}")

# DELETE /api/cart/clear - Clear all cart items  
@router.delete("/clear")
def clear_cart_items(request: Request, user: Optional[dict] = Depends(optional_auth)):
    try:
        carts_coll = db.get_collection("carts")
        
        if user:
            user_id = user.get("id")
            query = {"user": user_id}
        else:
            guest_id = get_guest_id_from_request(request)
            query = {"guest_id": guest_id}

        carts_coll.update_one(query, {"$set": {"items": []}}, upsert=True)

        return {"success": True, "message": "Cart cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cart: {str(e)}")