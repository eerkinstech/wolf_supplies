from fastapi import APIRouter, Depends, Body, HTTPException
from fastapi.responses import JSONResponse
from controllers.sliderController import (
    get_sliders,
    get_all_sliders,
    get_slider_by_id,
    create_slider,
    update_slider,
    delete_slider
)
from middleware.auth_middleware import protect, admin

router = APIRouter()

@router.get("/")
def fetch_sliders():
    """Get active sliders only (public endpoint)"""
    try:
        data = get_sliders()
        return JSONResponse(content=data, status_code=200)
    except Exception as e:
        print(f"[slider_routes] Error in fetch_sliders: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/debug")
def debug_sliders():
    """Debug endpoint to check slider data"""
    try:
        data = get_all_sliders()
        return JSONResponse(content=data, status_code=200)
    except Exception as e:
        print(f"[slider_routes] Error in debug_sliders: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/all")
def fetch_all_sliders():
    """Fetch all sliders (admin endpoint - no auth required for now)"""
    try:
        print("[slider_routes] Fetching all sliders...")
        data = get_all_sliders()
        print(f"[slider_routes] Returning {len(data) if isinstance(data, list) else 'unknown'} sliders")
        return JSONResponse(content=data, status_code=200)
    except Exception as e:
        print(f"[slider_routes] Error in fetch_all_sliders: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/{slider_id}")
async def fetch_slider_by_id(slider_id: str):
    """Get single slider by ID"""
    try:
        data = await get_slider_by_id(slider_id)
        if not data:
            return JSONResponse(content={"error": "Slider not found"}, status_code=404)
        return JSONResponse(content=data, status_code=200)
    except Exception as e:
        print(f"[slider_routes] Error in fetch_slider_by_id: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.post("/")
async def add_slider(data: dict = Body(...)):
    """Create new slider (no auth required for now)"""
    try:
        print(f"[slider_routes] POST /api/sliders - Creating slider with data: {data}")
        result = await create_slider(data)
        print(f"[slider_routes] Successfully created slider")
        return JSONResponse(content=result, status_code=201)
    except Exception as e:
        print(f"[slider_routes] Error in add_slider: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.put("/{slider_id}")
async def modify_slider(slider_id: str, data: dict = Body(...)):
    """Update slider (no auth required for now)"""
    try:
        print(f"[slider_routes] PUT /api/sliders/{slider_id} - Updating with data: {data}")
        result = await update_slider(slider_id, data)
        print(f"[slider_routes] Successfully updated slider")
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        print(f"[slider_routes] Error in modify_slider: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.delete("/{slider_id}")
async def remove_slider(slider_id: str):
    """Delete slider (no auth required for now)"""
    try:
        print(f"[slider_routes] DELETE /api/sliders/{slider_id}")
        result = await delete_slider(slider_id)
        print(f"[slider_routes] Successfully deleted slider")
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        print(f"[slider_routes] Error in remove_slider: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)