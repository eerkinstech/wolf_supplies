from fastapi import APIRouter, Depends, Body, HTTPException, Request, Security, Response
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

@router.get("", include_in_schema=False)
@router.get("/")
def fetch_cart(request: Request, response: Response, user: Optional[dict] = Depends(optional_auth)):
    try:
        carts_coll = db.get_collection("carts")
        cart = None
        if user:
            user_id = user.get("id")
            cart = carts_coll.find_one({"user": user_id})
        else:
            guest_id = request.cookies.get("guest_id")
            if not guest_id:
                guest_id = str(uuid.uuid4())
                response.set_cookie(key="guest_id", value=guest_id, httponly=True, max_age=60*60*24*30)
            cart = carts_coll.find_one({"guest_id": guest_id})
        items = []
        if cart:
            items = cart.get("items", [])
            if "_id" in cart:
                del cart["_id"]
        return {
            "success": True,
            "items": items,
            "cart": cart or {},
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# POST /api/cart - Add or update cart
@router.post("", include_in_schema=False)
@router.post("/")
def update_cart(request: Request, response: Response, payload: dict = Body(...), user: Optional[dict] = Depends(optional_auth)):
    try:
        carts_coll = db.get_collection("carts")
        items = payload.get("items", [])
        if user:
            user_id = user.get("id")
            result = carts_coll.update_one(
                {"user": user_id},
                {"$set": {"items": items}},
                upsert=True
            )
            cart = carts_coll.find_one({"user": user_id})
        else:
            guest_id = request.cookies.get("guest_id")
            if not guest_id:
                guest_id = str(uuid.uuid4())
                response.set_cookie(key="guest_id", value=guest_id, httponly=True, max_age=60*60*24*30)
            result = carts_coll.update_one(
                {"guest_id": guest_id},
                {"$set": {"items": items}},
                upsert=True
            )
            cart = carts_coll.find_one({"guest_id": guest_id})
        if cart and "_id" in cart:
            del cart["_id"]
        return {"success": True, "cart": cart or {}, "items": cart.get("items", []) if cart else []}
    except Exception as e:
        return {"success": False, "error": str(e)}

        # ...existing code...

# POST /api/cart/add - Add a single item to cart (merge if exists, else add)
@router.post("/add")
def add_to_cart(request: Request, response: Response, payload: dict = Body(...), user: Optional[dict] = Depends(optional_auth)):
    try:
        carts_coll = db.get_collection("carts")
        item = payload.get("item")
        if not item or not item.get("product"):
            raise HTTPException(status_code=400, detail="Missing item or product field")

        if user:
            query = {"user": user.get("id")}
        else:
            guest_id = request.cookies.get("guest_id")
            if not guest_id:
                guest_id = str(uuid.uuid4())
                response.set_cookie(key="guest_id", value=guest_id, httponly=True, max_age=60*60*24*30)
            query = {"guest_id": guest_id}

        cart = carts_coll.find_one(query)
        current_items = cart.get("items", []) if cart else []

        # Check if product already in cart
        existing = next((i for i in current_items if str(i.get("product")) == str(item["product"])), None)

        if existing:
            # If exists, update quantity if provided
            new_qty = item.get("quantity", 1)
            for i in current_items:
                if str(i.get("product")) == str(item["product"]):
                    i["quantity"] = new_qty
            carts_coll.update_one(query, {"$set": {"items": current_items}}, upsert=True)
        else:
            # Add new item
            if "quantity" not in item:
                item["quantity"] = 1
            current_items.append(item)
            carts_coll.update_one(query, {"$set": {"items": current_items}}, upsert=True)

        updated = carts_coll.find_one(query)
        if updated and "_id" in updated:
            del updated["_id"]

        return {
            "success": True,
            "message": "Added to cart" if not existing else "Updated cart item",
            "cart": updated or {},
            "items": updated.get("items", []) if updated else current_items
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to cart: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating cart: {str(e)}")

# DELETE /api/cart/clear - Clear all cart items  
@router.delete("/clear")
def clear_cart_items(request: Request, response: Response, user: Optional[dict] = Depends(optional_auth)):
    try:
        carts_coll = db.get_collection("carts")
        
        if user:
            user_id = user.get("id")
            query = {"user": user_id}
        else:
            guest_id = request.cookies.get("guest_id")
            if not guest_id:
                guest_id = str(uuid.uuid4())
                response.set_cookie(key="guest_id", value=guest_id, httponly=True, max_age=60*60*24*30)
            query = {"guest_id": guest_id}

        carts_coll.update_one(query, {"$set": {"items": []}}, upsert=True)

        return {"success": True, "message": "Cart cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cart: {str(e)}")
