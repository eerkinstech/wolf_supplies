from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
import os
from bson import ObjectId
from typing import Optional, Dict
from starlette.concurrency import run_in_threadpool

router = APIRouter()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Please set it in your .env file.")
client = MongoClient(DATABASE_URL)
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]


def _serialize_settings(doc: Optional[Dict]) -> Dict:
    if not doc:
        return {}
    result = {}
    for k, v in doc.items():
        if k == "_id":
            result["id"] = str(v) if v else None
        elif isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, dict):
            # Recursively serialize nested dicts
            serialized_dict = {}
            for dk, dv in v.items():
                if isinstance(dv, ObjectId):
                    serialized_dict[dk] = str(dv)
                elif isinstance(dv, dict):
                    serialized_dict[dk] = _serialize_settings(dv)
                elif isinstance(dv, list):
                    serialized_dict[dk] = [str(i) if isinstance(i, ObjectId) else i for i in dv]
                else:
                    serialized_dict[dk] = dv
            result[k] = serialized_dict
        elif isinstance(v, list):
            # Recursively serialize lists
            result[k] = [
                str(item) if isinstance(item, ObjectId) 
                else _serialize_settings(item) if isinstance(item, dict)
                else item
                for item in v
            ]
        else:
            result[k] = v
    return result


async def get_settings():
    try:
        def _fetch():
            coll = db.get_collection("settings")
            doc = coll.find_one({})
            if not doc:
                # Create default settings if none exist
                default = {
                    "menus": {"browseMenu": [], "topBarMenu": [], "mainNavMenu": [], "footerMenu": [], "policiesMenu": []},
                    "heroSection": {},
                    "featured_collections": [],
                }
                result = coll.insert_one(default)
                doc = coll.find_one({"_id": result.inserted_id})
            return doc

        doc = await run_in_threadpool(_fetch)
        return _serialize_settings(doc)
    except Exception as e:
        print(f"get_settings error: {e}")
        return {}


async def update_settings(data: dict):
    try:
        def _update():
            coll = db.get_collection("settings")
            # Find first document or create one
            doc = coll.find_one({})
            if not doc:
                result = coll.insert_one({"lastUpdated": None})
                _id = result.inserted_id
            else:
                _id = doc.get("_id")
            
            # Update the document
            coll.update_one({"_id": _id}, {"$set": data})
            return coll.find_one({"_id": _id})

        doc = await run_in_threadpool(_update)
        return _serialize_settings(doc)
    except Exception as e:
        print(f"update_settings error: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating settings: {str(e)}")


# Router endpoints
@router.get("/settings")
async def router_get_settings():
    return await get_settings()


@router.put("/settings")
async def router_update_settings(data: dict):
    return await update_settings(data)

