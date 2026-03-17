from fastapi import APIRouter, Depends, HTTPException, Query, Body, Request
from controllers.redirectController import (
    get_all_redirects,
    get_redirect_stats,
    get_redirect_by_id,
    create_redirect,
    update_redirect,
    delete_redirect,
    bulk_delete_redirects,
    toggle_redirect_status,
    resolve_redirect,
    search_redirects
)
from middleware.auth_middleware import protect, admin
from typing import Optional, List
from pydantic import BaseModel
import json

# Request models
class RedirectCreate(BaseModel):
    fromUrl: str
    toUrl: str
    isActive: Optional[bool] = True

class RedirectUpdate(BaseModel):
    fromUrl: str
    toUrl: str
    isActive: Optional[bool] = None

class BulkDeleteRequest(BaseModel):
    ids: List[str]

router = APIRouter(tags=["redirects"])


# Public test endpoint (no auth required)
@router.get("/admin/redirects/test")
async def test_endpoint():
    """Test endpoint - no auth required"""
    return {
        "status": "ok",
        "message": "API is responding",
        "timestamp": str(__import__('datetime').datetime.now())
    }


@router.get("/admin/redirects/stats")
async def fetch_stats(user=Depends(admin)):
    """Get redirect statistics - Admin only"""
    return await get_redirect_stats()


@router.get("/admin/redirects-list")
async def fetch_redirects_public(
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get all redirects - No auth required"""
    return await get_all_redirects(is_active=is_active, search=search)

@router.get("/admin/redirects")
async def fetch_redirects(
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    user=Depends(admin)
):
    """Get all redirects with optional filtering and search - Admin only"""
    return await get_all_redirects(is_active=is_active, search=search)


@router.get("/admin/redirects/{redirect_id}")
async def fetch_redirect(redirect_id: str, user=Depends(admin)):
    """Get a single redirect by ID"""
    return await get_redirect_by_id(redirect_id)


@router.post("/admin/redirects")
async def add_redirect(request: Request, data: RedirectCreate, user=Depends(admin)):
    """Create a new redirect"""
    import sys
    from pathlib import Path
    log_file = Path(__file__).parent.parent.parent / "redirect_debug.log"
    
    request_body = data.dict()
    log_msg = f"[POST /admin/redirects] Received - Headers: {dict(request.headers)} | User: {user} | Data: {request_body}\n"
    print(log_msg, end="")
    try:
        with open(log_file, "a") as f:
            f.write(log_msg)
    except:
        pass
    
    return await create_redirect(request_body)


@router.put("/admin/redirects/{redirect_id}")
async def modify_redirect(redirect_id: str, data: RedirectUpdate, user=Depends(admin)):
    """Update an existing redirect"""
    return await update_redirect(redirect_id, data.dict(exclude_unset=True))


@router.delete("/admin/redirects/{redirect_id}")
async def remove_redirect(redirect_id: str, user=Depends(admin)):
    """Delete a redirect"""
    print(f"[DELETE] Received delete request for redirect_id: {redirect_id}")
    
    if not redirect_id or redirect_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid redirect ID")
    
    return await delete_redirect(redirect_id)


@router.post("/admin/redirects/bulk-delete")
async def bulk_remove_redirects(request: Request, user=Depends(admin)):
    """Bulk delete multiple redirects"""
    try:
        body = await request.json()
        print(f"[DEBUG] Bulk delete request body: {body}")
        
        ids = body.get("ids", [])
        if not isinstance(ids, list):
            raise HTTPException(status_code=400, detail="ids must be an array")
        
        return await bulk_delete_redirects(ids)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Bulk delete error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/admin/redirects/{redirect_id}/toggle")
async def toggle_status(redirect_id: str, user=Depends(admin)):
    """Toggle redirect status"""
    return await toggle_redirect_status(redirect_id)


@router.get("/resolve-redirect")
async def resolve(from_url: str = Query(...)):
    """Public endpoint to resolve a redirect (no auth needed)"""
    return await resolve_redirect(from_url)


@router.get("/admin/redirects/search")
async def search(q: str = Query(...), user=Depends(admin)):
    """Search redirects"""
    return await search_redirects(q)