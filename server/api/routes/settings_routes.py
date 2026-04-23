from fastapi import APIRouter, Depends, Body, HTTPException
from fastapi.responses import JSONResponse
from bson import ObjectId
import json
from starlette.concurrency import run_in_threadpool
from middleware.auth_middleware import protect, admin
from utils.caching import cached_endpoint, response_cache
from database import db

router = APIRouter()

class MongoEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles MongoDB ObjectId"""
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

def check_settings_permission(user: dict, permission_id: str):
    """
    Check if user can manage settings for a specific feature
    Requires: Admin OR Employee with the specific permission
    """
    is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
    
    if is_admin:
        return True
    
    # Check if employee has permission
    custom_role = user.get("customRole")
    if custom_role and isinstance(custom_role, dict):
        permissions = custom_role.get("permissions", [])
        # Permissions can be strings or objects
        permission_ids = [p if isinstance(p, str) else p.get("id") or p.get("name") for p in permissions]
        return permission_id in permission_ids
    
    return False

@router.get("/featured-collections")
@cached_endpoint(ttl=600, key_prefix="featured_collections")
async def get_featured_collections():
    """Get featured categories and products from settings"""
    try:
        def _fetch():
            coll = db.get_collection("settings")
            doc = coll.find_one({})
            if not doc:
                return {"featuredCategories": {}, "featuredProducts": []}
            return {
                "featuredCategories": doc.get("featuredCategories", {}),
                "featuredProducts": doc.get("featuredProducts", [])
            }
        result = await run_in_threadpool(_fetch)
        # Use json.dumps to serialize with custom encoder, then JSONResponse
        json_str = json.dumps(result, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))
    except Exception as e:
        print(f"get_featured_collections error: {e}")
        return JSONResponse(content={"featuredCategories": {}, "featuredProducts": []})

@router.post("/featured-collections")
async def save_featured_collections(payload: dict = Body(...), user=Depends(protect)):
    """Save featured categories and/or products"""
    if not check_settings_permission(user, "collections"):
        raise HTTPException(status_code=403, detail="You don't have permission to manage collections")
    
    try:
        def _save():
            coll = db.get_collection("settings")
            doc = coll.find_one({})
            
            update_data = {}
            if "featuredCategories" in payload:
                update_data["featuredCategories"] = payload["featuredCategories"]
            if "featuredProducts" in payload:
                update_data["featuredProducts"] = payload["featuredProducts"]
            
            if doc:
                coll.update_one({"_id": doc["_id"]}, {"$set": update_data})
            else:
                coll.insert_one(update_data)
            
            updated_doc = coll.find_one({})
            return {
                "success": True,
                "featuredCategories": updated_doc.get("featuredCategories", {}),
                "featuredProducts": updated_doc.get("featuredProducts", [])
            }
        
        result = await run_in_threadpool(_save)
        response_cache.clear_matching("featured_collections:")
        json_str = json.dumps(result, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))
    except Exception as e:
        print(f"save_featured_collections error: {e}")
        json_str = json.dumps({"success": False, "error": str(e)}, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))

@router.get("/menus")
async def get_menus():
    """Get all menus (browse, topBar, mainNav, footer, policies)"""
    try:
        def _fetch():
            coll = db.get_collection("settings")
            doc = coll.find_one({})
            if not doc:
                return {
                    "browseMenu": [],
                    "topBarMenu": [],
                    "mainNavMenu": [],
                    "footerMenu": [],
                    "policiesMenu": []
                }
            return {
                "browseMenu": doc.get("browseMenu", []),
                "topBarMenu": doc.get("topBarMenu", []),
                "mainNavMenu": doc.get("mainNavMenu", []),
                "footerMenu": doc.get("footerMenu", []),
                "policiesMenu": doc.get("policiesMenu", [])
            }
        result = await run_in_threadpool(_fetch)
        json_str = json.dumps(result, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))
    except Exception as e:
        print(f"get_menus error: {e}")
        return JSONResponse(content={
            "browseMenu": [],
            "topBarMenu": [],
            "mainNavMenu": [],
            "footerMenu": [],
            "policiesMenu": []
        })

@router.post("/menus")
async def save_menus(payload: dict = Body(...), user=Depends(protect)):
    """Save all menus"""
    if not check_settings_permission(user, "menu"):
        raise HTTPException(status_code=403, detail="You don't have permission to manage menus")
    
    try:
        def _save():
            coll = db.get_collection("settings")
            doc = coll.find_one({})
            
            update_data = {}
            if "browseMenu" in payload:
                update_data["browseMenu"] = payload["browseMenu"]
            if "topBarMenu" in payload:
                update_data["topBarMenu"] = payload["topBarMenu"]
            if "mainNavMenu" in payload:
                update_data["mainNavMenu"] = payload["mainNavMenu"]
            if "footerMenu" in payload:
                update_data["footerMenu"] = payload["footerMenu"]
            if "policiesMenu" in payload:
                update_data["policiesMenu"] = payload["policiesMenu"]
            
            if doc:
                coll.update_one({"_id": doc["_id"]}, {"$set": update_data})
            else:
                coll.insert_one(update_data)
            
            updated_doc = coll.find_one({})
            return {
                "success": True,
                "browseMenu": updated_doc.get("browseMenu", []),
                "topBarMenu": updated_doc.get("topBarMenu", []),
                "mainNavMenu": updated_doc.get("mainNavMenu", []),
                "footerMenu": updated_doc.get("footerMenu", []),
                "policiesMenu": updated_doc.get("policiesMenu", [])
            }
        
        result = await run_in_threadpool(_save)
        json_str = json.dumps(result, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))
    except Exception as e:
        print(f"save_menus error: {e}")
        json_str = json.dumps({"success": False, "error": str(e)}, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))

@router.get("/pages")
async def get_pages_list():
    """Get all pages for menu selector"""
    try:
        def _fetch():
            coll = db.get_collection("pages")
            pages = list(coll.find({}, {"title": 1, "slug": 1, "_id": 1}))
            return pages
        result = await run_in_threadpool(_fetch)
        json_str = json.dumps(result, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))
    except Exception as e:
        print(f"get_pages_list error: {e}")
        return JSONResponse(content=[])

@router.get("/policies")
async def get_policies_list():
    """Get all policies for menu selector"""
    try:
        def _fetch():
            coll = db.get_collection("policies")
            policies = list(coll.find({}, {"title": 1, "slug": 1, "name": 1, "_id": 1}))
            return policies
        result = await run_in_threadpool(_fetch)
        json_str = json.dumps(result, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))
    except Exception as e:
        print(f"get_policies_list error: {e}")
        return JSONResponse(content=[])


@router.patch("/")
async def update_settings(payload: dict = Body(...), user=Depends(protect)):
    """Update settings like requireReviewApproval"""
    # Check if user is admin
    is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update settings")
    
    try:
        def _update():
            coll = db.get_collection("settings")
            doc = coll.find_one({})
            
            update_data = {}
            if "requireReviewApproval" in payload:
                update_data["requireReviewApproval"] = payload["requireReviewApproval"]
            
            if doc:
                coll.update_one({"_id": doc["_id"]}, {"$set": update_data})
            else:
                coll.insert_one(update_data)
            
            updated_doc = coll.find_one({})
            return {
                "success": True,
                "requireReviewApproval": updated_doc.get("requireReviewApproval", True)
            }
        
        result = await run_in_threadpool(_update)
        json_str = json.dumps(result, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))
    except Exception as e:
        print(f"update_settings error: {e}")
        json_str = json.dumps({"success": False, "error": str(e)}, cls=MongoEncoder)
        return JSONResponse(content=json.loads(json_str))
