from fastapi import APIRouter, HTTPException, Query
from pymongo import MongoClient
import os
from typing import Optional
from bson import ObjectId

router = APIRouter()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Please set it in your .env file.")
client = MongoClient(DATABASE_URL)
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]

def _serialize(obj):
    # Recursively convert ObjectId to string and ensure dicts/lists are plain Python types
    if obj is None:
        return None

    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, dict):
        result = {}
        for k, v in obj.items():
            result[k] = _serialize(v)
        return result
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    return obj


@router.get("/products")
def get_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1),
    limit: int = Query(20),
):
    try:
        coll = db.get_collection("products")
        query = {}

        if search:
            query["name"] = {"$regex": search, "$options": "i"}

        if category:
            category_refs = [category]
            try:
                category_refs.append(ObjectId(category))
            except Exception:
                pass

            query["$or"] = [
                {"category": category},
                {"categories": {"$in": category_refs}},
                {"categories.name": category},
                {"categories.slug": category},
            ]

        projection = {
            "name": 1,
            "slug": 1,
            "price": 1,
            "listingPrice": 1,
            "originalPrice": 1,
            "stock": 1,
            "inStock": 1,
            "images": 1,
            "image": 1,
            "categories": 1,
            "category": 1,
            "isDraft": 1,
            "rating": 1,
            "ratings": 1,
            "numReviews": 1,
            "variantCombinations": 1,
            "createdAt": 1,
        }

        count = coll.count_documents(query)
        cursor = (
            coll.find(query, projection)
            .sort("createdAt", -1)
            .skip((page - 1) * limit)
            .limit(limit)
        )
        products = [_serialize(p) for p in cursor]
        return {"products": products, "page": page, "pages": (count + limit - 1) // limit}
    except Exception as e:
        print("productController.get_products error:", type(e).__name__, repr(e))
        # Return safe empty response on error to avoid breaking frontend during development
        return {"products": [], "page": page, "pages": 0}


def get_product_by_id(product_id: str):
    """Get a single product by ID"""
    try:
        coll = db.get_collection("products")
        
        # Try to convert to ObjectId if it's a valid MongoDB ID
        try:
            oid = ObjectId(product_id)
            product = coll.find_one({"_id": oid})
        except Exception:
            # If it's not a valid ObjectId, try finding by string ID
            product = coll.find_one({"_id": product_id})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return _serialize(product)
    except HTTPException:
        raise
    except Exception as e:
        print(f"productController.get_product_by_id error: {type(e).__name__}: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get product: {str(e)}")


def get_product_by_slug(slug: str):
    """Get a single product by slug"""
    try:
        coll = db.get_collection("products")
        product = coll.find_one({"slug": slug})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return _serialize(product)
    except HTTPException:
        raise
    except Exception as e:
        print(f"productController.get_product_by_slug error: {type(e).__name__}: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get product: {str(e)}")


def create_product(data: dict, user=None):
    """Create a new product"""
    try:
        coll = db.get_collection("products")
        
        # Prepare the product document
        product = {
            "name": data.get("name", ""),
            "slug": data.get("slug", ""),
            "description": data.get("description", ""),
            "price": float(data.get("price", 0)),
            "originalPrice": float(data.get("originalPrice", 0)) if data.get("originalPrice") else None,
            "stock": int(data.get("stock", 0)),
            "images": data.get("images", []),
            "variants": data.get("variants", []),
            "variantCombinations": data.get("variantCombinations", []),
            "categories": data.get("categories", []),
            "benefits": data.get("benefits", ""),
            "benefitsHeading": data.get("benefitsHeading", ""),
            "metaTitle": data.get("metaTitle", ""),
            "metaDescription": data.get("metaDescription", ""),
            "metaKeywords": data.get("metaKeywords", ""),
            "isDraft": bool(data.get("isDraft", False)),
            "createdAt": {"$date": "2024-01-01T00:00:00Z"},
            "updatedAt": {"$date": "2024-01-01T00:00:00Z"},
        }
        
        result = coll.insert_one(product)
        product["_id"] = result.inserted_id
        return _serialize(product)
    except Exception as e:
        print(f"productController.create_product error: {type(e).__name__}: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")


def update_product(product_id: str, data: dict, user=None):
    """Update an existing product"""
    try:
        coll = db.get_collection("products")
        
        print(f"[update_product] Updating product {product_id} with data keys: {list(data.keys())}")
        
        # Try to convert to ObjectId if it's a valid MongoDB ID
        try:
            oid = ObjectId(product_id)
            query = {"_id": oid}
        except Exception:
            query = {"_id": product_id}
        
        print(f"[update_product] Query: {query}")
        
        # Check if product exists
        existing = coll.find_one(query)
        if not existing:
            print(f"[update_product] Product not found with query: {query}")
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Only update the fields that are provided in the request
        # This allows partial updates (e.g., just updating stock or variantCombinations)
        update_data = {}
        
        # Map of data fields to update - only include what's in the request
        field_mappings = {
            "name": str,
            "slug": str,
            "description": str,
            "price": float,
            "originalPrice": float,
            "stock": int,
            "images": list,
            "variants": list,
            "variantCombinations": list,
            "categories": list,
            "benefits": str,
            "benefitsHeading": str,
            "metaTitle": str,
            "metaDescription": str,
            "metaKeywords": str,
            "isDraft": bool,
        }
        
        for field, type_converter in field_mappings.items():
            if field in data:
                try:
                    if field in ["price", "originalPrice"]:
                        update_data[field] = float(data[field]) if data[field] is not None else None
                    elif field in ["stock"]:
                        update_data[field] = int(data[field]) if data[field] is not None else 0
                    elif field == "isDraft":
                        update_data[field] = bool(data[field])
                    else:
                        update_data[field] = data[field]
                except Exception as e:
                    print(f"[update_product] Error converting field {field}: {e}")
                    update_data[field] = data[field]
        
        # Always update the timestamp
        from datetime import datetime
        update_data["updatedAt"] = datetime.utcnow().isoformat()
        
        print(f"[update_product] Update data: {update_data}")
        
        # Perform the update
        result = coll.update_one(query, {"$set": update_data})
        
        print(f"[update_product] Update result - matched: {result.matched_count}, modified: {result.modified_count}")
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if result.modified_count == 0:
            print(f"[update_product] Warning: Product matched but was not modified")
        
        # Fetch and return the updated product
        updated = coll.find_one(query)
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated product")
        
        print(f"[update_product] Successfully updated product {product_id}")
        return _serialize(updated)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[update_product] ERROR: {type(e).__name__}: {repr(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")


def delete_product(product_id: str, user=None):
    """Delete a product"""
    try:
        coll = db.get_collection("products")
        
        # Try to convert to ObjectId if it's a valid MongoDB ID
        try:
            oid = ObjectId(product_id)
            query = {"_id": oid}
        except Exception:
            query = {"_id": product_id}
        
        result = coll.delete_one(query)
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"productController.delete_product error: {type(e).__name__}: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")
