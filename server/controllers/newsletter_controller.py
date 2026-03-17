from fastapi import HTTPException
from datetime import datetime
from pymongo import MongoClient
import os

# Get MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ecommerce"]

# Subscribe to newsletter
async def subscribe_newsletter(data: dict, user=None):
    try:
        email = data.get("email", "").strip().lower()
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")

        coll = db.get_collection("newsletter_subscriptions")
        
        # Check if already subscribed
        existing = coll.find_one({"email": email})
        
        if existing:
            if existing.get("status") == "unsubscribed":
                # Resubscribe
                coll.update_one(
                    {"email": email},
                    {"$set": {"status": "subscribed", "unsubscribed_at": None, "updated_at": datetime.utcnow()}}
                )
                return {
                    "success": True,
                    "message": "Welcome back! You have been resubscribed to our newsletter"
                }
            return {
                "success": True,
                "message": "Email already subscribed"
            }

        # Create new subscription
        subscription = {
            "email": email,
            "status": "subscribed",
            "verified": True,
            "verified_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = coll.insert_one(subscription)
        return {
            "success": True,
            "message": "You have been subscribed to our newsletter",
            "id": str(result.inserted_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error subscribing to newsletter: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error subscribing to newsletter: {str(e)}")

# Get all newsletter subscribers
async def get_subscribers(user=None):
    try:
        from bson import ObjectId
        # Helper to serialize documents
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
        
        coll = db.get_collection("newsletter_subscriptions")
        cursor = coll.find({}).sort("_id", -1)
        subscribers = [_serialize(doc) for doc in cursor]
        return subscribers
    except Exception as e:
        print(f"Error fetching subscribers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching subscribers: {str(e)}")

# Delete a subscriber
async def delete_subscriber(subscriber_id: str, user=None):
    try:
        from bson import ObjectId
        coll = db.get_collection("newsletter_subscriptions")
        sub_oid = ObjectId(subscriber_id) if ObjectId.is_valid(subscriber_id) else None
        if not sub_oid:
            raise HTTPException(status_code=400, detail="Invalid subscriber ID")
        
        result = coll.find_one_and_delete({"_id": sub_oid})
        if not result:
            raise HTTPException(status_code=404, detail="Subscriber not found")
        
        return {"message": "Subscriber deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting subscriber: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting subscriber: {str(e)}")