from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
import traceback
from middleware.auth_middleware import protect

# Try to import upload_media
try:
    from controllers.media_controller import upload_media
    print("[upload_routes] OK Successfully imported upload_media")
except ImportError as ie:
    print(f"[upload_routes] FAIL Failed to import upload_media: {ie}")
    traceback.print_exc()
    # Create a dummy function to prevent route registration failures
    async def upload_media(file):
        raise HTTPException(status_code=500, detail=f"upload_media not available: {ie}")

router = APIRouter()

@router.post("/", tags=["upload"])
async def upload(image: UploadFile = File(...), user: dict = Depends(protect)):
    """Upload a media file to the server - requires authentication"""
    try:
        print(f"\n[upload] ===== POST /api/upload =====")
        print(f"[upload] Filename: {image.filename}")
        print(f"[upload] Content-Type: {image.content_type}")
        print(f"[upload] User: {user.get('email', 'unknown')}")
        
        # Call the upload_media function
        result = await upload_media(image)
        print(f"[upload] ✓ Upload successful!")
        print(f"[upload] Result: {result}")
        return JSONResponse(content=result, status_code=200)
        
    except HTTPException as he:
        print(f"[upload] ✗ HTTP Exception: {he.status_code} - {he.detail}")
        raise
    except Exception as e:
        print(f"[upload] ✗ Unexpected error: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)