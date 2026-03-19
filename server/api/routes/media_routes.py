from fastapi import APIRouter, Depends, Body, HTTPException
from fastapi.responses import FileResponse
from controllers.media_controller import (
    get_media_list,
    delete_media
)
from middleware.auth_middleware import protect, admin
from database import db
from bson import ObjectId
import os

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
            raise HTTPException(status_code=400, detail="Invalid filename")

        uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
        collections = [
            db.get_collection("media"),
            db.get_collection("mediaassets"),
        ]

        media_doc = None
        for media_coll in collections:
            try:
                media_doc = media_coll.find_one({"_id": ObjectId(filename)})
            except Exception:
                media_doc = None

            if not media_doc:
                media_doc = media_coll.find_one({
                    "$or": [
                        {"storage_filename": filename},
                        {"filename": filename},
                        {"url": f"/api/media/serve/{filename}"},
                    ]
                })

            if media_doc:
                break

        resolved_name = None
        resolved_path = None
        if media_doc:
            resolved_path = (
                media_doc.get("storage_key_or_path")
                or media_doc.get("storageKeyOrPath")
            )
            resolved_name = (
                media_doc.get("storage_filename")
                or os.path.basename(resolved_path or "")
                or media_doc.get("filename")
            )
        else:
            resolved_name = filename

        file_path = (
            os.path.abspath(resolved_path)
            if resolved_path and os.path.isabs(resolved_path)
            else os.path.abspath(os.path.join(uploads_dir, resolved_name))
        )

        if not os.path.exists(file_path) and resolved_name:
            file_path = os.path.abspath(os.path.join(uploads_dir, os.path.basename(resolved_name)))

        # Verify file exists and is within uploads directory
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        if not os.path.realpath(file_path).startswith(os.path.realpath(uploads_dir)):
            raise HTTPException(status_code=404, detail="File not found")

        return FileResponse(file_path)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[serve_media] Error: {type(e).__name__}: {repr(e)}")
        raise HTTPException(status_code=500, detail="Failed to serve file")
