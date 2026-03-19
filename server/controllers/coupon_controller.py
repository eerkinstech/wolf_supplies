from fastapi import HTTPException
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os

# MongoDB connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Please set it in your .env file.")
client = MongoClient(DATABASE_URL)
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]

def normalize_coupon_data(data: dict):
    """Normalize camelCase field names from frontend to database format"""
    normalized = {}
    
    # Direct mappings (same names)
    for field in ["code", "description"]:
        if field in data and data[field] is not None:
            normalized[field] = data[field]
    
    # camelCase to snake_case mappings
    mappings = {
        "discountType": "discount_type",
        "discountValue": "discount_value",
        "maxUses": "max_uses",
        "validUntil": "expiry_date",
        "validFrom": "valid_from",
        "isActive": "active",
        "minimumOrderValue": "min_purchase",
        "productId": "product_id",
        "currentUses": "used_count"
    }
    
    for camel, snake in mappings.items():
        if camel in data and data[camel] is not None:
            normalized[snake] = data[camel]
    
    return normalized

def serialize_coupon(doc):
    """Helper to serialize MongoDB documents"""
    if doc is None:
        return None
    def walk(o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        if isinstance(o, dict):
            return {k: walk(v) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(i) for i in o]
        return o
    return walk(doc)

# Get all coupons
async def get_coupons(user=None):
    try:
        print(f"[coupon_controller.get_coupons] Fetching all coupons")
        coll = db.get_collection("coupons")
        coupons = list(coll.find({}).sort("_id", -1))
        serialized = [serialize_coupon(c) for c in coupons]
        print(f"[coupon_controller.get_coupons] Found {len(serialized)} coupons")
        return serialized
    except Exception as e:
        print(f"[coupon_controller.get_coupons] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching coupons: {str(e)}")

# Get single coupon by code
async def get_coupon_by_code(code: str):
    try:
        coll = db.get_collection("coupons")
        coupon = coll.find_one({"code": code})
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        return serialize_coupon(coupon)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching coupon: {str(e)}")


async def validate_coupon(data: dict):
    try:
        code = str(data.get("code", "")).strip().upper()
        order_total = float(data.get("orderTotal", 0) or 0)
        product_id = data.get("productId")
        product_ids = data.get("productIds") or []
        cart_items = data.get("cartItems") or []

        if not code:
            raise HTTPException(status_code=400, detail="Coupon code is required")

        coll = db.get_collection("coupons")
        coupon = coll.find_one({"code": code, "active": True})
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found or expired")

        now = datetime.utcnow()
        valid_from = coupon.get("valid_from")
        expiry_date = coupon.get("expiry_date")

        if isinstance(valid_from, str):
            try:
                valid_from = datetime.fromisoformat(valid_from.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                valid_from = None
        if isinstance(expiry_date, str):
            try:
                expiry_date = datetime.fromisoformat(expiry_date.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                expiry_date = None

        if valid_from and valid_from > now:
            raise HTTPException(status_code=400, detail="Coupon is not yet valid")
        if expiry_date and expiry_date < now:
            raise HTTPException(status_code=400, detail="Coupon has expired")

        max_uses = coupon.get("max_uses")
        used_count = int(coupon.get("used_count", 0) or 0)
        if max_uses is not None and used_count >= int(max_uses):
            raise HTTPException(status_code=400, detail="Coupon usage limit reached")

        coupon_product_id = coupon.get("product_id")
        applicable_total = order_total

        if coupon_product_id and isinstance(cart_items, list):
            coupon_product_id = str(coupon_product_id)
            matching_items = []
            for item in cart_items:
                item_product_id = item.get("product") or item.get("productId")
                if item_product_id and str(item_product_id) == coupon_product_id:
                    matching_items.append(item)

            if not matching_items:
                raise HTTPException(status_code=400, detail="Coupon is not valid for the products in your cart")

            applicable_total = sum(
                float(item.get("price", 0) or 0) * int(item.get("qty") or item.get("quantity") or 1)
                for item in matching_items
            )
        elif coupon_product_id:
            coupon_product_id = str(coupon_product_id)
            product_id_match = product_id and str(product_id) == coupon_product_id
            product_ids_match = isinstance(product_ids, list) and any(str(pid) == coupon_product_id for pid in product_ids if pid)
            if not product_id_match and not product_ids_match:
                raise HTTPException(status_code=400, detail="Coupon is not valid for the products in your cart")

        min_purchase = float(coupon.get("min_purchase", 0) or 0)
        if applicable_total < min_purchase:
            raise HTTPException(status_code=400, detail=f"Minimum order value of £{min_purchase} required")

        serialized = serialize_coupon(coupon) or {}
        discount_value = float(coupon.get("discount_value", 0) or 0)
        discount_type = coupon.get("discount_type")
        if discount_type == "percentage":
            discount = (applicable_total * discount_value) / 100
        else:
            discount = discount_value

        serialized["discount"] = min(max(discount, 0), applicable_total)
        return serialized
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating coupon: {str(e)}")

# Create new coupon
async def create_coupon(data: dict, user=None):
    try:
        # Normalize the input data
        norm_data = normalize_coupon_data(data)
        
        # Check required fields
        if "code" not in norm_data or not norm_data["code"]:
            raise HTTPException(status_code=400, detail="Coupon code is required")
        if "discount_type" not in norm_data:
            raise HTTPException(status_code=400, detail="Discount type is required")
        if "discount_value" not in norm_data:
            raise HTTPException(status_code=400, detail="Discount value is required")
        
        coll = db.get_collection("coupons")
        
        # Check if code already exists
        existing = coll.find_one({"code": norm_data["code"]})
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")
        
        # Build coupon document
        coupon = {
            "code": norm_data["code"],
            "description": norm_data.get("description", ""),
            "discount_type": norm_data.get("discount_type"),  # 'percentage' or 'fixed'
            "discount_value": float(norm_data.get("discount_value", 0)),
            "product_id": norm_data.get("product_id"),
            "min_purchase": float(norm_data.get("min_purchase", 0)),
            "max_uses": int(norm_data.get("max_uses")) if norm_data.get("max_uses") else None,
            "used_count": 0,
            "valid_from": norm_data.get("valid_from"),
            "expiry_date": norm_data.get("expiry_date"),
            "active": norm_data.get("active", True),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        print(f"[coupon_controller.create_coupon] Creating coupon: {coupon['code']}")
        result = coll.insert_one(coupon)
        coupon["_id"] = str(result.inserted_id)
        print(f"[coupon_controller.create_coupon] Coupon created with ID: {coupon['_id']}")
        return serialize_coupon(coupon)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[coupon_controller.create_coupon] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating coupon: {str(e)}")

# Update coupon
async def update_coupon(coupon_id: str, data: dict, user=None):
    try:
        if not ObjectId.is_valid(coupon_id):
            raise HTTPException(status_code=400, detail="Invalid coupon ID")
        
        # Normalize the input data
        norm_data = normalize_coupon_data(data)
        
        coll = db.get_collection("coupons")
        
        # Check if coupon exists
        coupon = coll.find_one({"_id": ObjectId(coupon_id)})
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        # Prepare update data - only include fields that were provided
        update_fields = {}
        
        if "code" in norm_data:
            # Check if new code already exists (if changing code)
            if norm_data["code"] != coupon.get("code"):
                existing = coll.find_one({"code": norm_data["code"]})
                if existing:
                    raise HTTPException(status_code=400, detail="Coupon code already exists")
            update_fields["code"] = norm_data["code"]
        
        if "description" in norm_data:
            update_fields["description"] = norm_data["description"]
        if "discount_type" in norm_data:
            update_fields["discount_type"] = norm_data["discount_type"]
        if "discount_value" in norm_data:
            update_fields["discount_value"] = float(norm_data["discount_value"])
        if "product_id" in norm_data:
            update_fields["product_id"] = norm_data["product_id"] if norm_data["product_id"] else None
        if "min_purchase" in norm_data:
            update_fields["min_purchase"] = float(norm_data["min_purchase"])
        if "max_uses" in norm_data:
            update_fields["max_uses"] = int(norm_data["max_uses"]) if norm_data["max_uses"] else None
        if "valid_from" in norm_data:
            update_fields["valid_from"] = norm_data["valid_from"]
        if "expiry_date" in norm_data:
            update_fields["expiry_date"] = norm_data["expiry_date"]
        if "active" in norm_data:
            update_fields["active"] = norm_data["active"]
        
        update_fields["updated_at"] = datetime.utcnow()
        
        print(f"[coupon_controller.update_coupon] Updating coupon {coupon_id} with: {list(update_fields.keys())}")
        result = coll.find_one_and_update(
            {"_id": ObjectId(coupon_id)},
            {"$set": update_fields},
            return_document=True
        )
        
        return serialize_coupon(result)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[coupon_controller.update_coupon] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating coupon: {str(e)}")

# Delete coupon
async def delete_coupon(coupon_id: str, user=None):
    try:
        if not ObjectId.is_valid(coupon_id):
            raise HTTPException(status_code=400, detail="Invalid coupon ID")
        
        coll = db.get_collection("coupons")
        
        result = coll.find_one_and_delete({"_id": ObjectId(coupon_id)})
        
        if not result:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        return {"success": True, "message": "Coupon deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting coupon: {str(e)}")
