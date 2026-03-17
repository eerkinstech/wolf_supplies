from pymongo import MongoClient
import os
from bson import ObjectId
from datetime import datetime

client = MongoClient(os.getenv("DATABASE_URL", "mongodb://localhost:27017"))
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]

def _serialize(doc: dict):
    if doc is None:
        return None
    def _walk(o):
        from bson import ObjectId
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

async def get_policies():
    try:
        coll = db.get_collection("policies")
        cursor = coll.find({}).sort("createdAt", -1)
        policies = [_serialize(p) for p in cursor]
        return policies
    except Exception as e:
        print("policy_controller.get_policies error:", type(e).__name__, repr(e))
        return []

async def get_policy_by_id(policy_id: str):
    try:
        coll = db.get_collection("policies")
        policy = coll.find_one({"_id": ObjectId(policy_id)})
        return _serialize(policy) if policy else None
    except Exception as e:
        print("policy_controller.get_policy_by_id error:", type(e).__name__, repr(e))
        return None

async def create_policy(data: dict, user=None):
    try:
        coll = db.get_collection("policies")
        policy_data = {
            "title": data.get("title"),
            "slug": data.get("slug") or (data.get("title") or "").lower().replace(" ", "-") ,
            "description": data.get("description"),
            "content": data.get("content"),
            "metaTitle": data.get("metaTitle"),
            "metaDescription": data.get("metaDescription"),
            "metaKeywords": data.get("metaKeywords"),
            "isPublished": data.get("isPublished", True),
            "createdAt": datetime.utcnow(),
        }
        result = coll.insert_one(policy_data)
        policy = coll.find_one({"_id": result.inserted_id})
        return _serialize(policy)
    except Exception as e:
        print("policy_controller.create_policy error:", type(e).__name__, repr(e))
        raise

async def update_policy(policy_id: str, data: dict, user=None):
    try:
        coll = db.get_collection("policies")
        update_data = {
            "title": data.get("title"),
            "slug": data.get("slug"),
            "description": data.get("description"),
            "content": data.get("content"),
            "metaTitle": data.get("metaTitle"),
            "metaDescription": data.get("metaDescription"),
            "metaKeywords": data.get("metaKeywords"),
            "isPublished": data.get("isPublished", True),
            "updatedAt": datetime.utcnow(),
        }
        update_data = {k: v for k, v in update_data.items() if v is not None}
        result = coll.update_one({"_id": ObjectId(policy_id)}, {"$set": update_data})
        if result.matched_count == 0:
            raise Exception("Policy not found")
        policy = coll.find_one({"_id": ObjectId(policy_id)})
        return _serialize(policy)
    except Exception as e:
        print("policy_controller.update_policy error:", type(e).__name__, repr(e))
        raise

async def delete_policy(policy_id: str, user=None):
    try:
        coll = db.get_collection("policies")
        result = coll.delete_one({"_id": ObjectId(policy_id)})
        if result.deleted_count == 0:
            raise Exception("Policy not found")
        return {"message": "Policy deleted successfully"}
    except Exception as e:
        print("policy_controller.delete_policy error:", type(e).__name__, repr(e))
        raise
