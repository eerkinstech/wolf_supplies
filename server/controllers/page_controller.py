from pymongo import MongoClient
import os
from bson import ObjectId
from datetime import datetime
from starlette.concurrency import run_in_threadpool

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

async def get_pages():
    try:
        print("[page_controller] get_pages() called")
        def _fetch():
            print("[page_controller] _fetch() - getting pages collection")
            coll = db.get_collection("pages")
            print("[page_controller] _fetch() - executing find()")
            cursor = coll.find({}).sort("createdAt", -1)
            print("[page_controller] _fetch() - serializing pages")
            pages = [_serialize(p) for p in cursor]
            print(f"[page_controller] _fetch() - found {len(pages)} pages")
            return pages
        
        print("[page_controller] get_pages() - calling run_in_threadpool")
        pages = await run_in_threadpool(_fetch)
        print(f"[page_controller] get_pages() - returning {len(pages)} pages")
        return pages
    except Exception as e:
        print(f"[page_controller] get_pages error: {type(e).__name__}: {repr(e)}")
        import traceback
        traceback.print_exc()
        raise

async def get_page_by_slug(slug: str):
    try:
        def _fetch():
            coll = db.get_collection("pages")
            page = coll.find_one({"slug": slug})
            return page
        
        page = await run_in_threadpool(_fetch)
        return _serialize(page) if page else None
    except Exception as e:
        print("page_controller.get_page_by_slug error:", type(e).__name__, repr(e))
        import traceback
        traceback.print_exc()
        return None

async def get_page_by_id(page_id: str):
    try:
        def _fetch():
            coll = db.get_collection("pages")
            page = coll.find_one({"_id": ObjectId(page_id)})
            return page
        
        page = await run_in_threadpool(_fetch)
        return _serialize(page) if page else None
    except Exception as e:
        print("page_controller.get_page_by_id error:", type(e).__name__, repr(e))
        import traceback
        traceback.print_exc()
        return None

async def create_page(data: dict, user=None):
    try:
        def _create():
            coll = db.get_collection("pages")
            page_data = {
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
            result = coll.insert_one(page_data)
            page = coll.find_one({"_id": result.inserted_id})
            return page
        
        page = await run_in_threadpool(_create)
        return _serialize(page)
    except Exception as e:
        print("page_controller.create_page error:", type(e).__name__, repr(e))
        import traceback
        traceback.print_exc()
        raise

async def update_page(page_id: str, data: dict, user=None):
    try:
        def _update():
            coll = db.get_collection("pages")
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
            # remove None values
            update_data = {k: v for k, v in update_data.items() if v is not None}
            result = coll.update_one({"_id": ObjectId(page_id)}, {"$set": update_data})
            if result.matched_count == 0:
                raise Exception("Page not found")
            page = coll.find_one({"_id": ObjectId(page_id)})
            return page
        
        page = await run_in_threadpool(_update)
        return _serialize(page)
    except Exception as e:
        print("page_controller.update_page error:", type(e).__name__, repr(e))
        import traceback
        traceback.print_exc()
        raise

async def delete_page(page_id: str, user=None):
    try:
        def _delete():
            coll = db.get_collection("pages")
            result = coll.delete_one({"_id": ObjectId(page_id)})
            if result.deleted_count == 0:
                raise Exception("Page not found")
            return {"message": "Page deleted successfully"}
        
        result = await run_in_threadpool(_delete)
        return result
    except Exception as e:
        print("page_controller.delete_page error:", type(e).__name__, repr(e))
        import traceback
        traceback.print_exc()
        raise
