from fastapi import APIRouter, Depends, Body, HTTPException
from controllers.page_controller import (
    get_pages,
    get_page_by_slug,
    get_page_by_id,
    create_page,
    update_page,
    delete_page
)
from middleware.auth_middleware import protect, admin

router = APIRouter()

def check_page_permission(user: dict):
    """Check if user can manage pages"""
    is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
    if is_admin:
        return True
    custom_role = user.get("customRole")
    if custom_role and isinstance(custom_role, dict):
        permissions = custom_role.get("permissions", [])
        permission_ids = [p if isinstance(p, str) else p.get("id") or p.get("name") for p in permissions]
        return "create-page" in permission_ids or "pages" in permission_ids
    return False

@router.get("/")
async def fetch_pages():
    try:
        print("[page_routes] GET / - Fetching all pages")
        pages = await get_pages()
        print(f"[page_routes] GET / - Found {len(pages)} pages")
        result = {"success": True, "pages": pages}
        print(f"[page_routes] GET / - Returning: {result}")
        return result
    except Exception as e:
        print(f"[page_routes] GET / - Error fetching pages: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching pages: {str(e)}")

@router.get("/admin/id/{page_id}")
async def fetch_page_by_id_admin(page_id: str):
    """Admin helper to fetch a page by id (used by admin UI)"""
    try:
        print(f"[page_routes] GET /admin/id/{page_id}")
        page = await get_page_by_id(page_id)
        if not page:
            raise HTTPException(status_code=404, detail="Page not found")
        print(f"[page_routes] GET /admin/id/{page_id} - Found page: {page.get('title', 'Untitled')}")
        return {"success": True, "page": page}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[page_routes] GET /admin/id/{page_id} - Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching page: {str(e)}")

@router.get("/{slug}")
async def fetch_page_by_slug(slug: str):
    try:
        print(f"[page_routes] GET /{slug}")
        page = await get_page_by_slug(slug)
        if not page:
            raise HTTPException(status_code=404, detail="Page not found")
        print(f"[page_routes] GET /{slug} - Found page")
        return page
    except HTTPException:
        raise
    except Exception as e:
        print(f"[page_routes] GET /{slug} - Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching page: {str(e)}")

@router.post("/")
async def add_page(data: dict = Body(...), user=Depends(protect)):
    if not check_page_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to create pages")
    try:
        page = await create_page(data, user)
        return page
    except Exception as e:
        print(f"Error creating page: {e}")
        raise


@router.put("/{page_id}")
async def modify_page(page_id: str, data: dict = Body(...), user=Depends(protect)):
    if not check_page_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to update pages")
    try:
        page = await update_page(page_id, data, user)
        return page
    except Exception as e:
        print(f"Error updating page: {e}")
        raise


@router.delete("/{page_id}")
async def remove_page(page_id: str, user=Depends(protect)):
    if not check_page_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to delete pages")
    try:
        result = await delete_page(page_id, user)
        return result
    except Exception as e:
        print(f"Error deleting page: {e}")
        raise