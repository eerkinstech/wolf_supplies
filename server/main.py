import os
import sys
# Ensure project root is on sys.path so imports like 'server.models' work
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
from fastapi import FastAPI, Request, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool
from dotenv import load_dotenv

# Import database from our database module
from database import client, db

import uvicorn

# Import routers
try:
    from api.routes.product_routes import router as product_router
except Exception as e:
    product_router = None
    print("Warning: product routes not loaded:", e)

# Load environment variables
load_dotenv()

app = FastAPI()

# Initialize default roles on startup
async def init_default_roles():
    """Initialize default Employee role if it doesn't exist"""
    try:
        from controllers.roles_controller import ensure_default_employee_role
        await ensure_default_employee_role()
    except Exception as e:
        print(f"Warning: Could not initialize default roles: {e}")

@app.on_event("startup")
async def startup_event():
    """Run initialization tasks on server startup"""
    await init_default_roles()

print("Initializing CORS middleware...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend dev server
        "http://localhost:3000",  # Alternative frontend
        "http://127.0.0.1:5173",  # Alternative localhost
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://localhost:5000",  # Backend server (for testing with tools like Postman)
        "http://localhost:8000",
    ],
    allow_credentials=True,  # REQUIRED for Authorization header (login, tokens)
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"],
    expose_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"],
    max_age=3600,
)
print("[OK] CORS middleware initialized - allowing localhost:5173 with credentials")

# =============================================================================
# EXCEPTION HANDLERS (MUST be before routes!)
# =============================================================================
def get_cors_headers(request: Request):
    """Get CORS headers based on origin"""
    origin = request.headers.get("origin")
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://localhost:8000",
    ]
    
    if origin in allowed_origins:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return {}

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTPException and return JSON with CORS headers"""
    print(f"[HTTPException] Status: {exc.status_code}, Detail: {exc.detail}")
    cors_headers = get_cors_headers(request)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status": exc.status_code,
            "path": str(request.url.path),
        },
        headers={
            **cors_headers,
            "Content-Type": "application/json",
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions and return JSON with CORS headers"""
    print(f"[Exception] {type(exc).__name__}: {str(exc)}")
    cors_headers = get_cors_headers(request)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "message": str(exc),
            "path": str(request.url.path),
        },
        headers={
            **cors_headers,
            "Content-Type": "application/json",
        }
    )

# =============================================================================
# ROOT ENDPOINT
# =============================================================================
@app.get("/api")
async def api_root():
    return {
        "status": "ok",
        "message": "E-Commerce API running",
    }

@app.get("/debug/routes")
async def debug_routes():
    """Debug endpoint to list all registered routes"""
    routes_list = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            routes_list.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": getattr(route, 'name', 'unknown')
            })
    return {"routes": sorted(routes_list, key=lambda x: x['path'])}

# =============================================================================
# INCLUDE API ROUTES
# =============================================================================
if product_router:
    app.include_router(product_router, prefix="/api/products")

# Include route modules (api/routes/*) so their endpoints are registered
try:
    from api.routes.auth_routes import router as auth_router
    app.include_router(auth_router, prefix="/api/users")
except Exception as e:
    print("Warning: auth routes not loaded:", e)

try:
    from api.routes.category_routes import router as api_category_router
    app.include_router(api_category_router, prefix="/api/categories")
except Exception as e:
    print("Warning: category api routes not loaded:", e)

try:
    from api.routes.slider_routes import router as api_slider_router
    app.include_router(api_slider_router, prefix="/api/sliders")
except Exception as e:
    print("Warning: slider api routes not loaded:", e)

try:
    from api.routes.settings_routes import router as api_settings_router
    app.include_router(api_settings_router, prefix="/api/settings")
except Exception as e:
    print("Warning: settings api routes not loaded:", e)

try:
    from api.routes.page_routes import router as api_page_router
    app.include_router(api_page_router, prefix="/api/pages")
except Exception as e:
    print("Warning: page api routes not loaded:", e)

# Ensure order routes are registered before any catch-all/static handlers


try:
    from api.routes.media_routes import router as api_media_router
    app.include_router(api_media_router, prefix="/api/media")
except Exception as e:
    print("Warning: media api routes not loaded:", e)

try:
    from api.routes.newsletter_routes import router as api_newsletter_router
    print("[MAIN] Including newsletter router with prefix /api/newsletter")
    app.include_router(api_newsletter_router, prefix="/api/newsletter")
    print("[MAIN] Newsletter router included successfully")
except Exception as e:
    print("Warning: newsletter api routes not loaded:", e)

try:
    from api.routes.upload_routes import router as api_upload_router
    print("[STARTUP] OK Upload routes imported successfully")
    print(f"[STARTUP] Upload router type: {type(api_upload_router)}")
    print(f"[STARTUP] Upload router routes: {[str(route) for route in api_upload_router.routes]}")
    app.include_router(api_upload_router, prefix="/api/upload")
    print("[STARTUP] OK Upload routes registered at /api/upload")
except Exception as e:
    print(f"[STARTUP] FAIL FAILED to load upload routes: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

try:
    from api.routes.order_routes import router as api_order_router
    app.include_router(api_order_router, prefix="/api/orders")
    print("[STARTUP] OK Order routes registered at /api/orders")
except Exception as e:
    print(f"[STARTUP] FAIL Order api routes not loaded: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

try:
    from api.routes.cart_routes import router as api_cart_router
    app.include_router(api_cart_router, prefix="/api/cart")
except Exception as e:
    print("Warning: cart api routes not loaded:", e)

try:
    from api.routes.wishlist_routes import router as api_wishlist_router
    app.include_router(api_wishlist_router, prefix="/api/wishlist")
except Exception as e:
    print("Warning: wishlist api routes not loaded:", e)

try:
    from api.routes.payment_routes import router as api_payment_router
    app.include_router(api_payment_router, prefix="/api/payments")
except Exception as e:
    print("Warning: payment api routes not loaded:", e)

try:
    from api.routes.pageConfigRoutes import router as api_pageconfig_router
    app.include_router(api_pageconfig_router, prefix="/api/page-config")
except Exception as e:
    print("Warning: page-config api routes not loaded:", e)

try:
    from api.routes.policy_routes import router as api_policy_router
    app.include_router(api_policy_router, prefix="/api/policies")
except Exception as e:
    print("Warning: policy api routes not loaded:", e)

try:
    from api.routes.coupon_routes import router as api_coupon_router
    app.include_router(api_coupon_router, prefix="/api/coupons")
except Exception as e:
    print("Warning: coupon api routes not loaded:", e)

try:
    from api.routes.roles_routes import router as api_roles_router
    app.include_router(api_roles_router, prefix="/api/roles")
except Exception as e:
    print("Warning: roles api routes not loaded:", e)

try:
    from api.routes.employees_routes import router as api_employees_router
    app.include_router(api_employees_router, prefix="/api/employees")
except Exception as e:
    print("Warning: employees api routes not loaded:", e)

try:
    from api.routes.sitemap_routes import router as api_sitemap_router
    app.include_router(api_sitemap_router, prefix="/api")
except Exception as e:
    print("Warning: sitemap api routes not loaded:", e)

try:
    from api.routes.gmc_feed_routes import router as api_gmc_router
    app.include_router(api_gmc_router, prefix="/api")
except Exception as e:
    print("Warning: gmc feed api routes not loaded:", e)

try:
    from api.routes.redirect_routes import router as api_redirect_router
    app.include_router(api_redirect_router, prefix="/api")
except Exception as e:
    print("Warning: redirect api routes not loaded:", e)

try:
    from api.routes.form_routes import router as api_form_router
    app.include_router(api_form_router, prefix="/api/forms")
except Exception as e:
    print("Warning: form api routes not loaded:", e)

# Slider routes are now registered via api.routes.slider_routes above

try:
    from controllers.categoryController import router as category_router
    app.include_router(category_router, prefix="/api")
except Exception as e:
    print("Warning: category routes not loaded:", e)

try:
    from controllers.settingsController import router as settings_router
    app.include_router(settings_router, prefix="/api")
except Exception as e:
    print("Warning: settings routes not loaded:", e)

try:
    from controllers.pageController import router as page_router
    app.include_router(page_router, prefix="/api")
except Exception as e:
    print("Warning: page routes not loaded:", e)

try:
    from controllers.mediaController import router as media_router
    app.include_router(media_router, prefix="/api")
except Exception as e:
    print("Warning: media routes not loaded:", e)

try:
    from controllers.productController import router as product_controller_router
    app.include_router(product_controller_router, prefix="/api")
except Exception as e:
    print("Warning: product controller routes not loaded:", e)

# =============================================================================
# DIRECT ENDPOINTS (bypassing route files to avoid import errors)
# =============================================================================
try:
    from controllers.category_controller import (
        get_categories,
        get_category_by_id,
        create_category,
        update_category,
        delete_category,
    )

    @app.get("/api/categories")
    async def api_get_categories():
        return await get_categories()

    @app.get("/api/categories/{category_id}")
    async def api_get_category(category_id: str):
        return await get_category_by_id(category_id)

    @app.post("/api/categories")
    async def api_create_category(data: dict):
        return await create_category(data)

    @app.put("/api/categories/{category_id}")
    async def api_update_category(category_id: str, data: dict):
        return await update_category(category_id, data)

    @app.delete("/api/categories/{category_id}")
    async def api_delete_category(category_id: str):
        return await delete_category(category_id)
except Exception as e:
    print("Warning: category direct endpoints not loaded:", e)

try:
    from controllers.media_controller import get_media_list, delete_media
    from middleware.auth_middleware import protect
    from fastapi import Body, HTTPException

    def check_media_permission(user: dict):
        """Check if user can manage media"""
        is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
        if is_admin:
            return True
        custom_role = user.get("customRole")
        if custom_role and isinstance(custom_role, dict):
            permissions = custom_role.get("permissions", [])
            permission_ids = [p if isinstance(p, str) else p.get("id") or p.get("name") for p in permissions]
            return "media" in permission_ids
        return False

    @app.get("/api/media")
    async def api_get_media(page: int = 1, limit: int = 24, search: str = None, type: str = None):
        return await get_media_list(page, limit, search, type)

    @app.delete("/api/media/{media_id}")
    async def api_delete_media_item(media_id: str):
        return await delete_media(media_id)
    
    @app.post("/api/media/bulk")
    async def api_bulk_delete_media(payload: dict = Body(...), user=Depends(protect)):
        """Bulk delete multiple media files"""
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

except Exception as e:
    print("Warning: media direct endpoints not loaded:", e)

try:
    from controllers.settingsController import get_settings, update_settings

    @app.get("/api/settings")
    async def api_get_settings():
        return await get_settings()

    @app.put("/api/settings")
    async def api_update_settings(data: dict):
        return await update_settings(data)
    
    @app.patch("/api/settings")
    async def api_patch_settings(data: dict):
        return await update_settings(data)
except Exception as e:
    print("Warning: settings direct endpoints not loaded:", e)

# Add direct login endpoint
@app.get("/api/users/profile")
async def api_user_profile(request: Request):
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"error": "Missing or invalid token"})
    token = auth_header.split(" ", 1)[1]
    try:
        from jose import jwt
        payload = jwt.decode(token, "eerkinstech", algorithms=["HS256"])
        user_id = payload.get("id")
        if not user_id:
            return JSONResponse(status_code=401, content={"error": "Invalid token"})
        from bson import ObjectId
        coll = db.get_collection("users")
        user = coll.find_one({"_id": ObjectId(user_id)})
        if not user:
            return JSONResponse(status_code=401, content={"error": "User not found"})
        return {
            "id": str(user.get("_id")),
            "email": user.get("email"),
            "username": user.get("username"),
            "name": user.get("name"),
            "role": user.get("role", "user"),
            "isAdmin": user.get("isAdmin", False),
            "customRole": user.get("customRole"),
        }
    except Exception as e:
        print(f"profile error: {e}")
        return JSONResponse(status_code=401, content={"error": "Invalid token or profile fetch failed"})
@app.post("/api/users/login")
async def api_login(credentials: dict):
    try:
        def _authenticate():
            try:
                from bcrypt import checkpw, hashpw
            except ImportError:
                checkpw = None
            coll = db.get_collection("users")
            email = credentials.get("email") or credentials.get("username")
            password = credentials.get("password")
            if not email or not password:
                print("[LOGIN ERROR] Missing email or password")
                return {"error": "Email/username and password required"}
            user = coll.find_one({"$or": [{"email": email}, {"username": email}]})
            if not user:
                print("[LOGIN ERROR] User not found")
                return {"error": "Invalid credentials"}
            stored_password = user.get("password", "")
            # Try bcrypt verification first (if password is hashed)
            if checkpw and isinstance(stored_password, str) and stored_password.startswith("$2"):
                try:
                    if checkpw(password.encode(), stored_password.encode()):
                        pass
                    else:
                        print("[LOGIN ERROR] Bcrypt password mismatch")
                        return {"error": "Invalid credentials"}
                except Exception as err:
                    print(f"[LOGIN ERROR] Bcrypt exception: {err}")
                    return {"error": "Invalid credentials"}
            elif stored_password != password:
                print("[LOGIN ERROR] Plaintext password mismatch")
                return {"error": "Invalid credentials"}
            try:
                from jose import jwt
                token = jwt.encode({"id": str(user.get("_id"))}, "eerkinstech", algorithm="HS256")
            except Exception as jwt_err:
                print(f"[LOGIN ERROR] JWT generation failed: {jwt_err}")
                return {"error": "Token generation failed"}
            # Get custom role and permissions
            role = user.get("role", "user")
            is_admin = user.get("isAdmin", False)
            custom_role = user.get("customRole")
            permissions = []
            
            # If user is an employee without a role, try to assign default "Employee" role
            if role == 'employee' and not is_admin and not custom_role:
                print(f"[AUTH] Employee {email} has no role, attempting to assign default Employee role...")
                roles_coll = db.get_collection("roles")
                default_role = roles_coll.find_one({"name": "Employee"})
                
                if default_role:
                    print(f"[AUTH] Found Employee role: {default_role.get('_id')}")
                    from bson import ObjectId
                    custom_role = {
                        "id": str(default_role.get("_id")),
                        "name": default_role.get("name"),
                        "permissions": default_role.get("permissions", []),
                    }
                    permissions = custom_role.get("permissions", [])
                    
                    # Update user document in database with the default role
                    try:
                        user_id = ObjectId(user.get("_id"))
                        print(f"[AUTH] Updating user {email} with custom role...")
                        result = coll.update_one(
                            {"_id": user_id},
                            {"$set": {"customRole": custom_role}}
                        )
                        print(f"[AUTH] ✓ Updated {result.modified_count} document(s)")
                    except Exception as e:
                        print(f"[AUTH] Error updating user: {type(e).__name__}: {e}")
                else:
                    print(f"[AUTH] ERROR: Employee role not found in database!")
            elif isinstance(custom_role, dict):
                permissions = custom_role.get("permissions", [])
            
            print(f"[AUTH] Login response for {email}: customRole={custom_role is not None}, permissions={len(permissions)}")
            
            user_data = {
                "id": str(user.get("_id")),
                "email": user.get("email"),
                "username": user.get("username"),
                "name": user.get("name"),
                "role": role,
                "isAdmin": is_admin,
                "customRole": custom_role,
                "permissions": permissions,
                "token": token,
            }
            return user_data
        result = await run_in_threadpool(_authenticate)
        if "error" in result:
            print(f"[LOGIN ERROR] {result['error']}")
            return JSONResponse(status_code=401, content=result)
        return result
    except Exception as e:
        print(f"[LOGIN ERROR] Exception: {e}")
        return JSONResponse(status_code=500, content={"error": "Login failed"})

# Debug: Print all registered routes (AFTER all API routes are registered)
print("\n[STARTUP] === ALL REGISTERED ROUTES ===")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"  {route.methods} {route.path}")
print("[STARTUP] === END ROUTES ===\n")

# =============================================================================
# TEST ENDPOINTS & API ENDPOINTS MUST BE BEFORE REACT SERVING
# =============================================================================
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "server": "running"}

# Direct orders endpoint for testing
@app.get("/api/orders")
async def get_all_orders_direct():
    """Get all orders - direct endpoint"""
    try:
        from bson import ObjectId
        from datetime import datetime
        def _serialize(doc):
            if doc is None:
                return None
            def _walk(o):
                if isinstance(o, ObjectId):
                    return str(o)
                if isinstance(o, datetime):
                    return o.isoformat()
                if isinstance(o, dict):
                    return {k: _walk(v) for k, v in o.items()}
                if isinstance(o, list):
                    return [_walk(i) for i in o]
                return o
            return _walk(doc)
        
        coll = db.get_collection("orders")
        cursor = coll.find({}).sort("_id", -1)
        orders = [_serialize(o) for o in cursor]
        print(f"[Direct Orders Endpoint] Returned {len(orders)} orders")
        return orders
    except Exception as e:
        print(f"[Direct Orders Endpoint] Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/test-post")
async def test_post_endpoint():
    """Test POST endpoint to debug 405 issues"""
    return {"message": "POST works!"}

# =============================================================================
# UPLOAD ENDPOINT (Fallback)
# =============================================================================
from fastapi import File, UploadFile
from fastapi.responses import JSONResponse

@app.post("/api/upload")
async def upload_file(image: UploadFile = File(...)):
    """Direct upload endpoint - accepts 'image' field from frontend"""
    try:
        print(f"\n[main.py] ===== UPLOAD REQUEST =====")
        print(f"[main.py] File: {image.filename}")
        print(f"[main.py] Content-Type: {image.content_type}")
        
        # Import and call upload_media
        try:
            from controllers.media_controller import upload_media
            result = await upload_media(image)
            print(f"[main.py] ✓ Upload successful!")
            return JSONResponse(content=result, status_code=200)
        except Exception as e:
            print(f"[main.py] ✗ Error calling upload_media: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Fallback: save file directly
            import uuid
            import shutil
            
            if not os.path.exists(uploads_folder):
                os.makedirs(uploads_folder)
            
            file_ext = os.path.splitext(image.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(uploads_folder, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            print(f"[main.py] ✓ File saved (fallback): {unique_filename}")
            return JSONResponse(
                content={
                    "success": True,
                    "filename": unique_filename,
                    "original_filename": image.filename,
                    "type": "image" if image.content_type.startswith("image") else "video",
                    "url": f"/uploads/{unique_filename}",
                },
                status_code=200
            )
    except Exception as e:
        print(f"[main.py] ✗ Upload failed: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

# =============================================================================
# SERVE REACT BUILD (AT THE END, AFTER ALL API ROUTES)
# =============================================================================
# Serve uploaded media files first
uploads_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
if os.path.exists(uploads_folder):
    app.mount("/uploads", StaticFiles(directory=uploads_folder), name="uploads")

# Now mount React assets and catch-all (AFTER all API endpoints)
dist_folder = os.path.abspath("../client/dist")

if os.path.exists(dist_folder):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_folder, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Never serve React HTML for API or uploads paths – those must be handled by FastAPI routes
        if full_path.startswith("api") or full_path.startswith("uploads"):
            raise HTTPException(status_code=404, detail="Not Found")

        # Serve React frontend for all other non-API paths
        file_path = os.path.join(dist_folder, full_path)

        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        # Serve index.html for frontend routing
        return FileResponse(os.path.join(dist_folder, "index.html"))

# =============================================================================
# START SERVER
# =============================================================================
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        reload=False,  # Disable reload to prevent caching issues
    )