from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse
from controllers.coupon_controller import (
    get_coupons,
    get_coupon_by_code,
    validate_coupon,
    create_coupon,
    update_coupon,
    delete_coupon
)
import traceback

router = APIRouter()

print("[COUPON ROUTER] Coupon router initialized")

@router.get("/list")
async def list_coupons():
    """Get all coupons"""
    try:
        print(f"[coupon_routes] GET /list called")
        coupons = await get_coupons()
        return JSONResponse(content=coupons, status_code=200)
    except Exception as e:
        print(f"[coupon_routes] Error: {str(e)}")
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@router.post("")
async def create_new_coupon(body: dict = Body(...)):
    """Create new coupon"""
    try:
        print(f"[coupon_routes] POST / called with body: {body}")
        result = await create_coupon(body, None)
        return JSONResponse(content=result, status_code=201)
    except Exception as e:
        print(f"[coupon_routes] POST Error: {str(e)}")
        traceback.print_exc()
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)


@router.post("/validate")
async def validate_coupon_code(body: dict = Body(...)):
    """Validate coupon for checkout"""
    try:
        result = await validate_coupon(body)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        status_code = getattr(e, "status_code", 500)
        detail = getattr(e, "detail", str(e))
        return JSONResponse(content={"success": False, "message": detail}, status_code=status_code)

@router.put("/{coupon_id}")
async def update_existing_coupon(coupon_id: str, body: dict = Body(...)):
    """Update coupon"""
    try:
        print(f"[coupon_routes] PUT /{coupon_id} called")
        result = await update_coupon(coupon_id, body, None)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        print(f"[coupon_routes] PUT Error: {str(e)}")
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@router.delete("/{coupon_id}")
async def delete_existing_coupon(coupon_id: str):
    """Delete coupon"""
    try:
        print(f"[coupon_routes] DELETE /{coupon_id} called")
        result = await delete_coupon(coupon_id, None)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        print(f"[coupon_routes] DELETE Error: {str(e)}")
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@router.get("/{code}")
async def get_by_code(code: str):
    """Get coupon by code"""
    try:
        print(f"[coupon_routes] GET /{code} called")
        result = await get_coupon_by_code(code)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        print(f"[coupon_routes] GET Code Error: {str(e)}")
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)
