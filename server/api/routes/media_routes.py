from fastapi import APIRouter, Depends, FileResponse, Body, HTTPException
from fastapi.staticfiles import StaticFiles
from controllers.media_controller import (
    get_media_list,
    delete_media
)
from middleware.auth_middleware import protect, admin
import os
from pathlib import Path

router = APIRouter()

def check_media_permission(user: dict):
    """
    Check if user can manage media (delete)
    Requires: Admin OR Employee with 'media' permission
    """
    is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
    
    if is_admin:
        return True
    
    # Check if employee has media permission
    custom_role = user.get("customRole")
    if custom_role and isinstance(custom_role, dict):
        permissions = custom_role.get("permissions", [])
        # Permissions can be strings or objects
        permission_ids = [p if isinstance(p, str) else p.get("id") or p.get("name") for p in permissions]
        return "media" in permission_ids
    
    return False

@router.get("/")
async def fetch_media_list():
    return await get_media_list()

@router.delete("/{media_id}")
async def remove_media(media_id: str, user=Depends(protect)):
    if not check_media_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to delete media")
    return await delete_media(media_id)

@router.post("/bulk")
async def bulk_delete_media(payload: dict = Body(...), user=Depends(protect)):
    """
    Bulk delete multiple media files
    Expected payload: { "ids": ["id1", "id2", ...] }
    """
    if not check_media_permission(user):
        raise HTTPException(status_code=403, detail="You don't have permission to delete media")
    
    try:
        media_ids = payload.get("ids", [])
        
        if not media_ids or not isinstance(media_ids, list):
            raise HTTPException(status_code=400, detail="ids must be a non-empty array")
        
        deleted_count = 0
        errors = []
        
        for media_id in media_ids:
            try:
                result = await delete_media(media_id)
                if result.get("success"):
                    deleted_count += 1
                else:
                    errors.append(f"{media_id}: {result.get('error', 'Unknown error')}")
            except Exception as e:
                errors.append(f"{media_id}: {str(e)}")
        
        return {
            "success": True,
            "deleted": deleted_count,
            "total": len(media_ids),
            "message": f"Successfully deleted {deleted_count}/{len(media_ids)} media files",
            "errors": errors if errors else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk delete failed: {str(e)}")

@router.get("/serve/{filename}")
async def serve_media(filename: str):
    """Serve uploaded media files"""
    try:
        # Security: prevent directory traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            return {"error": "Invalid filename"}
        
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
        file_path = os.path.join(uploads_dir, filename)
        
        # Verify file exists and is within uploads directory
        file_path_real = os.path.realpath(file_path)
        uploads_dir_real = os.path.realpath(uploads_dir)
        
        if not file_path_real.startswith(uploads_dir_real) or not os.path.exists(file_path_real):
            return {"error": "File not found"}
        
        return FileResponse(file_path_real)
    except Exception as e:
        print(f"[serve_media] Error: {type(e).__name__}: {repr(e)}")
        return {"error": "Failed to serve file"}