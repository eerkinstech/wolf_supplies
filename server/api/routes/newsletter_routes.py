from fastapi import APIRouter, Query, Request, Body
from fastapi.responses import JSONResponse
from controllers.newsletter_controller import (
    subscribe_newsletter,
    get_subscribers,
    delete_subscriber
)
import traceback

router = APIRouter()

print("[ROUTER INIT] Newsletter router being initialized")

@router.get("/debug", tags=["newsletter"])
async def debug_newsletter():
    """Debug endpoint to verify route is registered"""
    return {
        "success": True,
        "message": "Newsletter routes ARE registered and working!",
        "timestamp": str(__import__('datetime').datetime.now())
    }

print("[ROUTER INIT] /debug route added")

@router.get("/", tags=["newsletter"])
async def fetch_all_subscriptions(
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    status: str = Query("subscribed")
):
    """Get all newsletter subscriptions (public endpoint for AdminChatPage)"""
    print(f"\n[newsletter_routes] ===== GET /api/newsletter =====")
    try:
        subscriptions = await get_subscribers(None)
        
        # Filter by status if needed
        if status and status != "all":
            subscriptions = [s for s in subscriptions if s.get("status") == status]
        
        # Apply pagination
        paginated = subscriptions[skip : skip + limit]
        
        response = {
            "success": True,
            "data": paginated,
            "total": len(subscriptions),
            "count": len(paginated),
            "limit": limit,
            "skip": skip
        }
        print(f"[newsletter_routes] ✓ Retrieved {len(paginated)} subscribers")
        return JSONResponse(content=response, status_code=200)
        
    except Exception as e:
        print(f"[newsletter_routes] ✗ Error: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            content={"success": False, "error": str(e), "data": []},
            status_code=500
        )

@router.get("/list", tags=["newsletter"])
async def fetch_all_subscriptions_list(
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    status: str = Query("subscribed")
):
    """Get all newsletter subscriptions - /list alias (for AdminCustomersPage)"""
    print(f"\n[newsletter_routes] ===== GET /api/newsletter/list =====")
    try:
        subscriptions = await get_subscribers(None)
        
        # Filter by status if needed
        if status and status != "all":
            subscriptions = [s for s in subscriptions if s.get("status") == status]
        
        # Apply pagination
        paginated = subscriptions[skip : skip + limit]
        
        response = {
            "success": True,
            "data": paginated,
            "total": len(subscriptions),
            "count": len(paginated),
            "limit": limit,
            "skip": skip
        }
        print(f"[newsletter_routes] ✓ Retrieved {len(paginated)} subscribers via /list")
        return JSONResponse(content=response, status_code=200)
        
    except Exception as e:
        print(f"[newsletter_routes] ✗ Error: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            content={"success": False, "error": str(e), "data": []},
            status_code=500
        )

@router.post("/subscribe", tags=["newsletter"])
async def subscribe(data: dict = Body(...)):
    """Subscribe email to newsletter (public)"""
    try:
        print(f"\n[newsletter_routes] ===== POST /api/newsletter/subscribe =====")
        email = data.get('email')
        print(f"[newsletter_routes] Email: {email}")
        
        if not email:
            return JSONResponse(
                content={"success": False, "message": "Email is required"},
                status_code=400
            )
        
        result = await subscribe_newsletter(data)
        print(f"[newsletter_routes] ✓ Subscription successful!")
        return JSONResponse(content=result, status_code=200)
        
    except Exception as e:
        print(f"[newsletter_routes] ✗ Error: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            content={"success": False, "message": str(e)},
            status_code=500
        )

@router.post("/unsubscribe", tags=["newsletter"])
async def unsubscribe(data: dict = Body(...)):
    """Unsubscribe email from newsletter (public)"""
    try:
        print(f"\n[newsletter_routes] ===== POST /api/newsletter/unsubscribe =====")
        email = data.get('email')
        print(f"[newsletter_routes] Email: {email}")
        
        if not email:
            return JSONResponse(
                content={"success": False, "message": "Email is required"},
                status_code=400
            )
        
        # Mark as unsubscribed in database
        from pymongo import MongoClient
        import os
        from datetime import datetime
        
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        client = MongoClient(MONGO_URI)
        db_conn = client["ecommerce"]
        newsletter_collection = db_conn.get_collection("newsletter_subscriptions")
        
        result = newsletter_collection.update_one(
            {"email": email.lower()},
            {"$set": {"status": "unsubscribed", "unsubscribedAt": datetime.utcnow()}}
        )
        
        return JSONResponse(
            content={
                "success": True,
                "message": "You have been unsubscribed from our newsletter",
                "data": {"email": email}
            },
            status_code=200
        )
        
    except Exception as e:
        print(f"[newsletter_routes] ✗ Error: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            content={"success": False, "message": str(e)},
            status_code=500
        )

print("[ROUTER INIT] Newsletter routes registered successfully")