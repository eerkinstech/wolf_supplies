from fastapi import APIRouter, Depends, HTTPException
from controllers.category_controller import (
    get_categories,
    get_category_by_id,
    create_category,
    update_category,
    delete_category
)
from middleware.auth_middleware import protect, admin

router = APIRouter()

def check_category_permission(user: dict):
    """
    Check if user can manage categories (create, update, delete)
    Requires: Admin OR Employee with 'categories' permission
    """
    is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
    
    if is_admin:
        return True
    
    # Check if employee has categories permission
    custom_role = user.get("customRole")
    if custom_role and isinstance(custom_role, dict):
        permissions = custom_role.get("permissions", [])
        # Permissions can be strings or objects
        permission_ids = [p if isinstance(p, str) else p.get("id") or p.get("name") for p in permissions]
        return "categories" in permission_ids
    
    return False

@router.get("/")
async def fetch_categories():
    return await get_categories()

@router.get("/slug/{slug}")
async def fetch_category_by_slug(slug: str):
    return await get_category_by_id(slug)

@router.get("/{category_id}")
async def fetch_category_by_id(category_id: str):
    return await get_category_by_id(category_id)

@router.post("/")
async def add_category(data: dict, user=Depends(protect)):
    if not check_category_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to create categories")
    return await create_category(data, user)

@router.put("/{category_id}")
async def modify_category(category_id: str, data: dict, user=Depends(protect)):
    if not check_category_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to update categories")
    return await update_category(category_id, data, user)

@router.delete("/{category_id}")
async def remove_category(category_id: str, user=Depends(protect)):
    if not check_category_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to delete categories")
    return await delete_category(category_id, user)