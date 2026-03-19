from fastapi import APIRouter, Depends, Body, HTTPException, Request, Security, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from middleware.auth_middleware import get_user_by_id
from database import db
from bson import ObjectId
from typing import Optional
from jose import jwt, JWTError
import uuid
from datetime import datetime
from copy import deepcopy

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


def _build_wishlist_query(request: Request, response: Response, user: Optional[dict]) -> dict:
    if user:
        return {"user": user.get("id")}

    guest_id = request.cookies.get("guest_id")
    if not guest_id:
        guest_id = str(uuid.uuid4())
        response.set_cookie(key="guest_id", value=guest_id, httponly=True, max_age=60 * 60 * 24 * 30)
    return {"guest_id": guest_id}


def _sanitize_wishlist_doc(wishlist: Optional[dict]) -> dict:
    if not wishlist:
        return {}
    cleaned = deepcopy(wishlist)
    cleaned.pop("_id", None)
    return cleaned


def _build_snapshot_key(snapshot: Optional[dict]) -> Optional[str]:
    if not isinstance(snapshot, dict):
        return None

    variant_id = snapshot.get("variantId")
    if variant_id:
        return f"variant:{variant_id}"

    selected_variants = snapshot.get("selectedVariants") or {}
    if not isinstance(selected_variants, dict):
        selected_variants = {}

    parts = []
    for key in sorted(selected_variants.keys()):
        parts.append(f"{key}:{selected_variants.get(key)}")

    selected_size = snapshot.get("selectedSize")
    if selected_size:
        parts.append(f"selectedSize:{selected_size}")

    selected_color = snapshot.get("selectedColor")
    if selected_color:
        parts.append(f"selectedColor:{selected_color}")

    if not parts:
        return None

    return "|".join(parts)


def _match_wishlist_item(
    item: dict,
    product_id: str,
    variant_id: Optional[str] = None,
    snapshot_key: Optional[str] = None,
) -> bool:
    item_product_id = item.get("product") or item.get("productId")
    if str(item_product_id) != str(product_id):
        return False

    if variant_id is None:
        if snapshot_key:
            item_snapshot_key = item.get("snapshotKey") or _build_snapshot_key(item.get("snapshot"))
            return item_snapshot_key == snapshot_key
        return True

    snapshot = item.get("snapshot") or {}
    item_variant_id = item.get("variantId") or snapshot.get("variantId")
    return str(item_variant_id) == str(variant_id)

@router.get("", include_in_schema=False)
@router.get("/")
def fetch_wishlist(request: Request, response: Response, user: Optional[dict] = Depends(optional_auth)):
    try:
        wishlists_coll = db.get_collection("wishlists")
        query = _build_wishlist_query(request, response, user)
        wishlist = wishlists_coll.find_one(query)

        items = wishlist.get("items", []) if wishlist else []
        return {
            "success": True,
            "items": items,
            "wishlist": _sanitize_wishlist_doc(wishlist),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# POST /api/wishlist - Add or update wishlist
@router.post("", include_in_schema=False)
@router.post("/")
def update_wishlist(request: Request, response: Response, payload: dict = Body(...), user: Optional[dict] = Depends(optional_auth)):
    try:
        wishlists_coll = db.get_collection("wishlists")
        query = _build_wishlist_query(request, response, user)
        existing = wishlists_coll.find_one(query) or {}
        current_items = existing.get("items", [])

        if "items" in payload and isinstance(payload.get("items"), list):
            next_items = payload.get("items", [])
        else:
            product_id = payload.get("productId") or payload.get("product_id")
            snapshot = payload.get("snapshot")

            if not product_id:
                raise HTTPException(status_code=400, detail="Missing productId")

            variant_id = None
            if isinstance(snapshot, dict):
                variant_id = snapshot.get("variantId")
            snapshot_key = _build_snapshot_key(snapshot)

            item_exists = any(_match_wishlist_item(item, product_id, variant_id, snapshot_key) for item in current_items)
            if item_exists:
                next_items = current_items
            else:
                next_item = {
                    "product": product_id,
                    "productId": product_id,
                    "addedAt": datetime.utcnow().isoformat(),
                }
                if isinstance(snapshot, dict):
                    next_item["snapshot"] = snapshot
                    if snapshot.get("variantId"):
                        next_item["variantId"] = snapshot.get("variantId")
                    if snapshot_key:
                        next_item["snapshotKey"] = snapshot_key
                next_items = [*current_items, next_item]

        wishlists_coll.update_one(
            query,
            {
                "$set": {
                    **query,
                    "items": next_items,
                    "updatedAt": datetime.utcnow().isoformat(),
                },
                "$setOnInsert": {"createdAt": datetime.utcnow().isoformat()},
            },
            upsert=True,
        )
        wishlist = wishlists_coll.find_one(query)
        items = wishlist.get("items", []) if wishlist else []
        return {"success": True, "wishlist": _sanitize_wishlist_doc(wishlist), "items": items}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        return {"success": False, "error": str(e)}

# POST /api/wishlist/add - Add a single item to wishlist (no duplicates)

@router.post("/add")
def add_to_wishlist(request: Request, response: Response, payload: dict = Body(...), user: Optional[dict] = Depends(optional_auth)):
    try:
        wishlists_coll = db.get_collection("wishlists")
        product_id = payload.get("product_id")
        if not product_id:
            raise HTTPException(status_code=400, detail="Missing product_id")

        query = _build_wishlist_query(request, response, user)

        wishlist = wishlists_coll.find_one(query)
        current_items = wishlist.get("items", []) if wishlist else []

        if not any(str(item.get("product")) == str(product_id) for item in current_items):
            new_item = {"product": product_id, "addedAt": datetime.utcnow().isoformat()}
            current_items.append(new_item)

        wishlists_coll.update_one(
            query,
            {
                "$set": {
                    **query,
                    "items": current_items,
                    "updatedAt": datetime.utcnow().isoformat(),
                },
                "$setOnInsert": {"createdAt": datetime.utcnow().isoformat()},
            },
            upsert=True,
        )

        updated_wishlist = wishlists_coll.find_one(query)
        items = updated_wishlist.get("items", []) if updated_wishlist else []

        return {
            "success": True,
            "message": "Item added to wishlist" if not any(str(item.get("product")) == str(product_id) for item in current_items[:-1]) else "Item already in wishlist",
            "items": items
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to wishlist: {str(e)}")

# DELETE /api/wishlist/{item_id} - Remove item from wishlist
@router.delete("/{item_id}")
def remove_from_wishlist_endpoint(
    item_id: str,
    request: Request,
    response: Response,
    user: Optional[dict] = Depends(optional_auth),
    variantId: Optional[str] = None,
    snapshotKey: Optional[str] = None,
):
    try:
        wishlists_coll = db.get_collection("wishlists")
        query = _build_wishlist_query(request, response, user)
        wishlist = wishlists_coll.find_one(query) or {}
        current_items = wishlist.get("items", [])

        next_items = [
            item for item in current_items
            if not _match_wishlist_item(item, item_id, variantId, snapshotKey)
        ]

        wishlists_coll.update_one(
            query,
            {
                "$set": {
                    **query,
                    "items": next_items,
                    "updatedAt": datetime.utcnow().isoformat(),
                }
            },
            upsert=True,
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


@router.delete("")
@router.delete("/")
def clear_wishlist(request: Request, response: Response, user: Optional[dict] = Depends(optional_auth)):
    try:
        wishlists_coll = db.get_collection("wishlists")
        query = _build_wishlist_query(request, response, user)
        wishlists_coll.update_one(
            query,
            {
                "$set": {
                    **query,
                    "items": [],
                    "updatedAt": datetime.utcnow().isoformat(),
                },
                "$setOnInsert": {"createdAt": datetime.utcnow().isoformat()},
            },
            upsert=True,
        )
        return {"success": True, "message": "Wishlist cleared", "items": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing wishlist: {str(e)}")
