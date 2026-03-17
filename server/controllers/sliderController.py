from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
import os
from bson import ObjectId
from datetime import datetime

# Use a local Mongo client to query collections (keeps controllers self-contained)
client = MongoClient(os.getenv("DATABASE_URL", "mongodb://localhost:27017"))
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]

def _serialize(doc: dict):
    # Recursively convert ObjectId to string and ensure dicts/lists are plain Python types
    if doc is None:
        return None
    from bson import ObjectId

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


def get_sliders():
    try:
        coll = db.get_collection("sliders")
        cursor = coll.find({"isActive": True}).sort("order", 1)
        sliders = [_serialize(s) for s in cursor]
        return sliders
    except Exception as e:
        print("sliderController.get_sliders error:", type(e).__name__, repr(e))
        # Return an empty list on error to avoid breaking frontend rendering during development
        return []


def get_all_sliders():
    try:
        coll = db.get_collection("sliders")
        cursor = coll.find().sort("order", 1)
        sliders = [_serialize(s) for s in cursor]
        print(f"sliderController.get_all_sliders: Found {len(sliders)} sliders")
        return sliders
    except Exception as e:
        print("sliderController.get_all_sliders error:", type(e).__name__, repr(e))
        import traceback
        traceback.print_exc()
        return []


async def get_slider_by_id(slider_id: str):
    try:
        coll = db.get_collection("sliders")
        slider = coll.find_one({"_id": ObjectId(slider_id)})
        return _serialize(slider) if slider else None
    except Exception as e:
        print("sliderController.get_slider_by_id error:", type(e).__name__, repr(e))
        return None


async def create_slider(data: dict, user=None):
    try:
        coll = db.get_collection("sliders")
        # Get the highest order value
        highest_order = coll.find_one(sort=[("order", -1)])
        next_order = (highest_order.get("order", 0) + 1) if highest_order else 1
        
        slider_data = {
            "title": data.get("title"),
            "description": data.get("description"),
            "buttonText": data.get("buttonText", "Shop Now"),
            "buttonLink": data.get("buttonLink", "/products"),
            "bgImage": data.get("bgImage"),
            "isActive": data.get("isActive", True),
            "order": next_order,
        }
        
        result = coll.insert_one(slider_data)
        slider = coll.find_one({"_id": result.inserted_id})
        return _serialize(slider)
    except Exception as e:
        print("sliderController.create_slider error:", type(e).__name__, repr(e))
        raise


async def update_slider(slider_id: str, data: dict, user=None):
    try:
        coll = db.get_collection("sliders")
        
        update_data = {
            "title": data.get("title"),
            "description": data.get("description"),
            "buttonText": data.get("buttonText", "Shop Now"),
            "buttonLink": data.get("buttonLink", "/products"),
            "bgImage": data.get("bgImage"),
            "isActive": data.get("isActive", True),
        }
        
        # Only update order if provided
        if "order" in data:
            update_data["order"] = data.get("order")
        
        result = coll.update_one(
            {"_id": ObjectId(slider_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise Exception("Slider not found")
        
        slider = coll.find_one({"_id": ObjectId(slider_id)})
        return _serialize(slider)
    except Exception as e:
        print("sliderController.update_slider error:", type(e).__name__, repr(e))
        raise


async def delete_slider(slider_id: str, user=None):
    try:
        coll = db.get_collection("sliders")
        result = coll.delete_one({"_id": ObjectId(slider_id)})
        
        if result.deleted_count == 0:
            raise Exception("Slider not found")
        
        return {"message": "Slider deleted successfully"}
    except Exception as e:
        print("sliderController.delete_slider error:", type(e).__name__, repr(e))
        raise
