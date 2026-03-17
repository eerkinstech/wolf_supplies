from fastapi import APIRouter, Depends, Body, HTTPException
from controllers.product_controller import (
    get_products,
    get_product_by_id,
    get_product_by_slug,
    create_product,
    update_product,
    delete_product
)
from middleware.auth_middleware import protect, admin
from database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def check_product_permission(user: dict):
    """
    Check if user can manage products (create, update, delete)
    Requires: Admin OR Employee with 'add-product' permission
    """
    is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
    
    if is_admin:
        return True
    
    # Check if employee has add-product permission
    custom_role = user.get("customRole")
    if custom_role and isinstance(custom_role, dict):
        permissions = custom_role.get("permissions", [])
        # Permissions can be strings or objects
        permission_ids = [p if isinstance(p, str) else p.get("id") or p.get("name") for p in permissions]
        return "add-product" in permission_ids
    
    return False

@router.get("/")
async def fetch_products():
    return await get_products()

@router.get("/{product_id}")
async def fetch_product_by_id(product_id: str):
    return await get_product_by_id(product_id)

@router.get("/slug/{slug}")
async def fetch_product_by_slug(slug: str):
    return await get_product_by_slug(slug)

@router.post("/")
async def add_product(data: dict = Body(...), user=Depends(protect)):
    if not check_product_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to create products")
    return await create_product(data, user)

def process_variants(raw_variants):
    """
    Process and normalize variants to ensure correct structure
    Expected: [{"name": "Size", "values": ["S", "M", "L"]}, ...]
    """
    if not raw_variants or not isinstance(raw_variants, list):
        return []
    
    processed = []
    for variant in raw_variants:
        if isinstance(variant, dict):
            # Ensure variant has name and values
            variant_obj = {
                "name": variant.get("name") or "",
                "values": []
            }
            # Get values - can be a list or needs to be extracted
            values = variant.get("values", [])
            if isinstance(values, list):
                variant_obj["values"] = [str(v) for v in values if v]
            processed.append(variant_obj)
    
    return processed

def process_variant_combinations(raw_combinations, variants=None):
    """
    Process and normalize variant combinations to ensure correct structure
    Expected: [{"variantValues": {"Size": "M", "Color": "Red"}, "sku": "...", "price": 10.0, "stock": 5, "image": "..."}, ...]
    Also populates variant values if not already populated
    """
    if not raw_combinations or not isinstance(raw_combinations, list):
        return [], variants or []
    
    processed = []
    variant_values_collector = {}
    
    for combo in raw_combinations:
        if isinstance(combo, dict):
            combo_obj = {
                "variantValues": combo.get("variantValues") or {},
                "sku": combo.get("sku") or "",
                "price": float(combo.get("price", 0)) if combo.get("price") else 0,
                "stock": int(combo.get("stock", 0)) if combo.get("stock") else 0,
                "image": combo.get("image") or ""
            }
            processed.append(combo_obj)
            
            # Collect variant values for auto-population
            if combo_obj["variantValues"] and isinstance(combo_obj["variantValues"], dict):
                for variant_name, variant_value in combo_obj["variantValues"].items():
                    if variant_name not in variant_values_collector:
                        variant_values_collector[variant_name] = set()
                    variant_values_collector[variant_name].add(str(variant_value))
    
    # Auto-populate variant values from combinations if variants list is provided
    if variants and variant_values_collector:
        for variant in variants:
            if variant.get("name") in variant_values_collector:
                variant["values"] = list(variant_values_collector[variant["name"]])
    
    return processed, variants or []

@router.post("/import")
async def import_products(payload: dict = Body(...), user=Depends(protect)):
    """
    Bulk import products from CSV data
    Expected payload: { "products": [...array of product objects...] }
    Requires: Admin OR Employee with 'add-product' permission
    """
    if not check_product_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to import products")
    
    try:
        products_data = payload.get("products", [])
        
        if not products_data:
            raise HTTPException(status_code=400, detail="No products provided for import")
        
        if not isinstance(products_data, list):
            raise HTTPException(status_code=400, detail="Products must be an array")
        
        products_coll = db.get_collection("products")
        imported_count = 0
        errors = []
        
        for idx, product_data in enumerate(products_data):
            try:
                # Validate required fields
                if not product_data.get("name"):
                    errors.append(f"Row {idx + 1}: Missing product name")
                    continue
                
                if product_data.get("price") is None:
                    errors.append(f"Row {idx + 1}: Missing product price")
                    continue
                
                # Process and normalize variants
                raw_variants = product_data.get("variants", [])
                processed_variants = process_variants(raw_variants)
                
                # Process and normalize variant combinations
                raw_combinations = product_data.get("variantCombinations", [])
                processed_combinations, processed_variants = process_variant_combinations(
                    raw_combinations, 
                    processed_variants
                )
                
                # Check if product exists by name
                existing = products_coll.find_one({"name": product_data.get("name")})
                
                if existing:
                    # Update existing product
                    update_data = {
                        "updatedAt": datetime.utcnow(),
                        **{k: v for k, v in product_data.items() if k != "_id"}
                    }
                    
                    # Merge variant combinations instead of replacing
                    if processed_combinations:
                        existing_combinations = existing.get("variantCombinations", [])
                        # Avoid duplicates by checking if variantValues already exists
                        for new_combo in processed_combinations:
                            combo_exists = False
                            for existing_combo in existing_combinations:
                                if existing_combo.get("variantValues") == new_combo.get("variantValues"):
                                    # Update existing combination
                                    existing_combo.update(new_combo)
                                    combo_exists = True
                                    break
                            if not combo_exists:
                                # Add new combination
                                existing_combinations.append(new_combo)
                        update_data["variantCombinations"] = existing_combinations
                    
                    # Merge variants - preserve existing variants and add new ones
                    if processed_variants:
                        existing_variants = existing.get("variants", [])
                        for new_var in processed_variants:
                            var_exists = False
                            for existing_var in existing_variants:
                                if existing_var.get("name") == new_var.get("name"):
                                    # Merge values
                                    existing_values = set(existing_var.get("values", []))
                                    new_values = set(new_var.get("values", []))
                                    existing_var["values"] = list(existing_values | new_values)
                                    var_exists = True
                                    break
                            if not var_exists:
                                # Add new variant
                                existing_variants.append(new_var)
                        update_data["variants"] = existing_variants
                    
                    products_coll.update_one(
                        {"_id": existing["_id"]},
                        {"$set": update_data}
                    )
                else:
                    # Create new product
                    new_product = {
                        "name": product_data.get("name"),
                        "slug": product_data.get("slug", product_data.get("name", "").lower().replace(" ", "-")),
                        "description": product_data.get("description", ""),
                        "price": float(product_data.get("price", 0)),
                        "originalPrice": float(product_data.get("originalPrice", 0)) if product_data.get("originalPrice") else None,
                        "discount": float(product_data.get("discount", 0)),
                        "stock": int(product_data.get("stock", 0)),
                        "categories": product_data.get("categories", []),
                        "isDraft": product_data.get("isDraft", False),
                        "rating": float(product_data.get("rating", 0)),
                        "numReviews": int(product_data.get("numReviews", 0)),
                        "metaTitle": product_data.get("metaTitle", ""),
                        "metaDescription": product_data.get("metaDescription", ""),
                        "metaKeywords": product_data.get("metaKeywords", ""),
                        "benefitsHeading": product_data.get("benefitsHeading", "Why Buy This Product"),
                        "benefits": product_data.get("benefits", ""),
                        "sku": product_data.get("sku", ""),
                        "images": product_data.get("images", []),
                        "variants": processed_variants,
                        "variantCombinations": processed_combinations,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow(),
                    }
                    
                    products_coll.insert_one(new_product)
                
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")
                continue
        
        response = {
            "success": True,
            "imported": imported_count,
            "total": len(products_data),
            "message": f"Successfully imported {imported_count}/{len(products_data)} products"
        }
        
        if errors:
            response["errors"] = errors
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

@router.put("/{product_id}")
async def modify_product(product_id: str, data: dict = Body(...), user=Depends(protect)):
    if not check_product_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to update products")
    return await update_product(product_id, data, user)

@router.delete("/{product_id}")
async def remove_product(product_id: str, user=Depends(protect)):
    if not check_product_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to delete products")
    return await delete_product(product_id, user)


@router.get("/{product_id}/reviews")
async def get_reviews(product_id: str):
    """
    Get approved reviews for a product
    """
    try:
        products_coll = db.get_collection("products")
        try:
            product_oid = ObjectId(product_id)
            product = products_coll.find_one({"_id": product_oid})
        except Exception:
            product = products_coll.find_one({"_id": product_id})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get only approved reviews
        reviews = product.get("reviews", [])
        approved_reviews = [
            {
                "id": str(r.get("_id", "")),
                "name": r.get("name", r.get("userName", "Anonymous")),
                "email": r.get("email", r.get("userEmail", "")),
                "rating": r.get("rating", 0),
                "title": r.get("title", ""),
                "comment": r.get("comment", ""),
                "createdAt": r.get("createdAt", "").isoformat() if r.get("createdAt") else "",
            }
            for r in reviews
            if r.get("isApproved", False)
        ]
        
        return {
            "success": True,
            "reviews": approved_reviews,
            "totalReviews": len(approved_reviews),
            "avgRating": product.get("rating", 0),
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reviews: {str(e)}")


@router.post("/{product_id}/reviews")
async def submit_review(product_id: str, data: dict = Body(...)):
    """
    Submit a review for a product (no login required)
    Required fields: rating, comment, email
    Optional: title, name
    
    Reviews will be auto-approved if requireReviewApproval is false in settings,
    otherwise they require admin approval.
    """
    try:
        # Validate required fields
        if "rating" not in data:
            raise HTTPException(status_code=400, detail="Rating is required")
        
        if not data.get("email") or not str(data.get("email")).strip():
            raise HTTPException(status_code=400, detail="Email is required")
        
        if not data.get("comment") or not str(data.get("comment")).strip():
            raise HTTPException(status_code=400, detail="Comment is required")
        
        try:
            rating = float(data.get("rating", 0))
            if rating < 1 or rating > 5:
                raise ValueError("Rating must be between 1 and 5")
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid rating value")
        
        # Get product
        products_coll = db.get_collection("products")
        try:
            product_oid = ObjectId(product_id)
            product = products_coll.find_one({"_id": product_oid})
        except Exception:
            product = products_coll.find_one({"_id": product_id})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Check for duplicate review (same email + product)
        user_email = str(data.get("email", "")).strip().lower()
        existing_reviews = product.get("reviews", [])
        if isinstance(existing_reviews, list):
            existing_review = next(
                (r for r in existing_reviews if str(r.get("email", "")).strip().lower() == user_email),
                None
            )
            if existing_review:
                raise HTTPException(
                    status_code=400,
                    detail=f"You have already submitted a review for this product. Only one review per email per product is allowed."
                )
        
        # Check if review approval is required
        settings_coll = db.get_collection("settings")
        settings = settings_coll.find_one({}) or {}
        require_approval = settings.get("requireReviewApproval", True)  # Default to requiring approval
        
        # Create review object
        review = {
            "_id": ObjectId(),
            "email": user_email,
            "name": str(data.get("name") or data.get("email", "")).strip() or "Anonymous",
            "rating": rating,
            "title": data.get("title", ""),
            "comment": str(data.get("comment", "")).strip(),
            "isApproved": not require_approval,  # Auto-approve if approval not required
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        
        # Add review to product's reviews array
        reviews = product.get("reviews", [])
        if not isinstance(reviews, list):
            reviews = []
        reviews.append(review)
        
        # Update product with new review and recalculate rating (only count approved reviews)
        total_rating = sum(r.get("rating", 0) for r in reviews if r.get("isApproved", False))
        approved_count = sum(1 for r in reviews if r.get("isApproved", False))
        new_avg_rating = total_rating / approved_count if approved_count > 0 else 0
        
        products_coll.update_one(
            {"_id": product["_id"]},
            {
                "$set": {
                    "reviews": reviews,
                    "rating": round(new_avg_rating, 1),
                    "numReviews": approved_count,
                    "updatedAt": datetime.utcnow(),
                }
            }
        )
        
        # Determine the message based on approval requirement
        if require_approval:
            message = "Review submitted successfully. Awaiting admin approval."
        else:
            message = "Review submitted successfully and is now visible."
        
        return {
            "success": True,
            "message": message,
            "autoApproved": not require_approval,
            "review": {
                "id": str(review["_id"]),
                "email": review["email"],
                "name": review["name"],
                "rating": review["rating"],
                "title": review["title"],
                "comment": review["comment"],
                "isApproved": review["isApproved"],
                "createdAt": review["createdAt"].isoformat(),
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting review: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit review: {str(e)}")


@router.delete("/{product_id}/reviews/{review_index}")
async def delete_review(product_id: str, review_index: int, user=Depends(protect)):
    """
    Delete a review from a product (Admin only)
    """
    try:
        # Check if user is admin
        is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
        if not is_admin:
            raise HTTPException(status_code=403, detail="Only admins can delete reviews")
        
        # Get product
        products_coll = db.get_collection("products")
        try:
            product_oid = ObjectId(product_id)
            product = products_coll.find_one({"_id": product_oid})
        except Exception:
            product = products_coll.find_one({"_id": product_id})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get reviews
        reviews = product.get("reviews", [])
        if not isinstance(reviews, list):
            raise HTTPException(status_code=400, detail="Invalid reviews format")
        
        # Check if review index is valid
        if review_index < 0 or review_index >= len(reviews):
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Remove review at index
        reviews.pop(review_index)
        
        # Recalculate rating based on approved reviews
        total_rating = sum(r.get("rating", 0) for r in reviews if r.get("isApproved", False))
        approved_count = sum(1 for r in reviews if r.get("isApproved", False))
        new_avg_rating = total_rating / approved_count if approved_count > 0 else 0
        
        # Update product
        products_coll.update_one(
            {"_id": product["_id"]},
            {
                "$set": {
                    "reviews": reviews,
                    "rating": round(new_avg_rating, 1),
                    "numReviews": approved_count,
                    "updatedAt": datetime.utcnow(),
                }
            }
        )
        
        return {
            "success": True,
            "message": "Review deleted successfully",
            "numReviews": approved_count,
            "rating": round(new_avg_rating, 1)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting review: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete review: {str(e)}")


@router.patch("/{product_id}/reviews/{review_index}")
async def update_review_approval(product_id: str, review_index: int, data: dict = Body(...), user=Depends(protect)):
    """
    Update review approval status (Admin only)
    Expected body: { "isApproved": true/false }
    """
    try:
        # Check if user is admin
        is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
        if not is_admin:
            raise HTTPException(status_code=403, detail="Only admins can update review approval")
        
        # Get product
        products_coll = db.get_collection("products")
        try:
            product_oid = ObjectId(product_id)
            product = products_coll.find_one({"_id": product_oid})
        except Exception:
            product = products_coll.find_one({"_id": product_id})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get reviews
        reviews = product.get("reviews", [])
        if not isinstance(reviews, list):
            raise HTTPException(status_code=400, detail="Invalid reviews format")
        
        # Check if review index is valid
        if review_index < 0 or review_index >= len(reviews):
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Update review approval status
        is_approved = data.get("isApproved", False)
        reviews[review_index]["isApproved"] = bool(is_approved)
        reviews[review_index]["updatedAt"] = datetime.utcnow()
        
        # Recalculate rating based on approved reviews
        total_rating = sum(r.get("rating", 0) for r in reviews if r.get("isApproved", False))
        approved_count = sum(1 for r in reviews if r.get("isApproved", False))
        new_avg_rating = total_rating / approved_count if approved_count > 0 else 0
        
        # Update product
        products_coll.update_one(
            {"_id": product["_id"]},
            {
                "$set": {
                    "reviews": reviews,
                    "rating": round(new_avg_rating, 1),
                    "numReviews": approved_count,
                    "updatedAt": datetime.utcnow(),
                }
            }
        )
        
        return {
            "success": True,
            "message": f"Review {'approved' if is_approved else 'disapproved'} successfully",
            "numReviews": approved_count,
            "rating": round(new_avg_rating, 1),
            "isApproved": is_approved
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating review approval: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update review: {str(e)}")


@router.patch("/{product_id}/reviews/{review_index}/approve")
async def approve_review(product_id: str, review_index: int, user=Depends(protect)):
    """
    Approve a review (Admin only)
    """
    try:
        # Check if user is admin
        is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
        if not is_admin:
            raise HTTPException(status_code=403, detail="Only admins can approve reviews")
        
        # Get product
        products_coll = db.get_collection("products")
        try:
            product_oid = ObjectId(product_id)
            product = products_coll.find_one({"_id": product_oid})
        except Exception:
            product = products_coll.find_one({"_id": product_id})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get reviews
        reviews = product.get("reviews", [])
        if not isinstance(reviews, list):
            raise HTTPException(status_code=400, detail="Invalid reviews format")
        
        # Check if review index is valid
        if review_index < 0 or review_index >= len(reviews):
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Mark review as approved
        reviews[review_index]["isApproved"] = True
        reviews[review_index]["updatedAt"] = datetime.utcnow()
        
        # Recalculate rating based on approved reviews
        total_rating = sum(r.get("rating", 0) for r in reviews if r.get("isApproved", False))
        approved_count = sum(1 for r in reviews if r.get("isApproved", False))
        new_avg_rating = total_rating / approved_count if approved_count > 0 else 0
        
        # Update product
        products_coll.update_one(
            {"_id": product["_id"]},
            {
                "$set": {
                    "reviews": reviews,
                    "rating": round(new_avg_rating, 1),
                    "numReviews": approved_count,
                    "updatedAt": datetime.utcnow(),
                }
            }
        )
        
        return {
            "success": True,
            "message": "Review approved successfully",
            "numReviews": approved_count,
            "rating": round(new_avg_rating, 1)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error approving review: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to approve review: {str(e)}")


@router.post("/validate")
async def validate_cart_products(data: dict = Body(...)):
    """
    Validate if cart products still exist in database
    Expects: { "productIds": ["id1", "id2", ...] }
    Returns: { "valid": ["id1"], "invalid": ["id2"] }
    """
    try:
        from bson import ObjectId
        
        product_ids = data.get("productIds", [])
        if not isinstance(product_ids, list):
            raise HTTPException(status_code=400, detail="productIds must be an array")
        
        products_coll = db.get_collection("products")
        
        valid_ids = []
        invalid_ids = []
        
        for prod_id in product_ids:
            try:
                # Try as ObjectId first
                obj_id = ObjectId(prod_id)
                product = products_coll.find_one({"_id": obj_id})
            except Exception:
                # Try as string
                product = products_coll.find_one({"_id": prod_id})
            
            if product:
                valid_ids.append(str(prod_id))
            else:
                invalid_ids.append(str(prod_id))
        
        return {
            "success": True,
            "valid": valid_ids,
            "invalid": invalid_ids
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error validating products: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to validate products: {str(e)}")