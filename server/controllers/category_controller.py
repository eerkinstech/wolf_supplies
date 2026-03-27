from fastapi import HTTPException
from pymongo import MongoClient
import os
from bson import ObjectId
from typing import List, Dict
from starlette.concurrency import run_in_threadpool

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Please set it in your .env file.")
client = MongoClient(DATABASE_URL)
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]


def _normalize_asset_url(value):
    if isinstance(value, str) and ("/uploads/" in value or "/api/media/serve/" in value):
        if "/uploads/" in value:
            return f"/uploads/{value.split('/uploads/', 1)[1]}"
        if "/api/media/serve/" in value:
            return f"/api/media/serve/{value.split('/api/media/serve/', 1)[1]}"
    return value


def _serialize_cat(doc: Dict) -> Dict:
    if not doc:
        return {}
    result = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, dict):
            result[k] = _serialize_cat(v)
        elif isinstance(v, list):
            result[k] = [_serialize_cat(item) if isinstance(item, dict) else (str(item) if isinstance(item, ObjectId) else item) for item in v]
        elif isinstance(v, str):
            result[k] = _normalize_asset_url(v)
        else:
            result[k] = v
    return result


def _build_tree(docs: List[Dict]) -> List[Dict]:
    """Build tree from already-serialized documents"""
    by_id = {}
    roots = []
    
    # Build lookup map from serialized docs
    for doc in docs:
        sd = _serialize_cat(doc)
        by_id[str(sd["_id"])] = sd
        sd["subcategories"] = []
    
    # Assign parents/children
    for doc in docs:
        parent_id = doc.get("parent")
        if parent_id:
            parent_id_str = str(parent_id)
            child_id = str(doc.get("_id"))
            parent_node = by_id.get(parent_id_str)
            child_node = by_id.get(child_id)
            if parent_node and child_node:
                parent_node["subcategories"].append(child_node)
        else:
            child_id = str(doc.get("_id"))
            child = by_id.get(child_id)
            if child:
                roots.append(child)
    
    return roots


def _count_products_for_category(cat_id: str) -> int:
    try:
        coll = db.get_collection("products")
        category_refs = [cat_id]
        try:
            category_refs.append(ObjectId(cat_id))
        except Exception:
            pass

        return coll.count_documents({"categories": {"$in": category_refs}})
    except Exception:
        return 0


async def get_categories(all_categories: bool = False):
    try:
        def _fetch():
            coll = db.get_collection("categories")
            docs = list(coll.find({}).sort("name", 1))
            return docs

        docs = await run_in_threadpool(_fetch)
        
        if not docs:
            return []
        
        # Build tree from raw docs (tree building will serialize)
        tree = _build_tree(docs)

        # Annotate product_count recursively
        def _annotate(nodes: List[Dict]):
            for node in nodes:
                count = _count_products_for_category(node["_id"]) or 0
                node["product_count"] = count
                node["productCount"] = count
                if node.get("subcategories"):
                    _annotate(node["subcategories"])

        _annotate(tree)
        return tree
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"get_categories error: {e}")
        return []


async def get_category_by_id(category_id: str):
    try:
        def _fetch():
            coll = db.get_collection("categories")
            # try by ObjectId first
            try:
                doc = coll.find_one({"_id": ObjectId(category_id)})
            except Exception:
                doc = coll.find_one({"slug": category_id})
            return doc

        doc = await run_in_threadpool(_fetch)
        if not doc:
            raise HTTPException(status_code=404, detail="Category not found")
        return _serialize_cat(doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching category: {str(e)}")


async def create_category(data: dict, user=None):
    try:
        def _create():
            coll = db.get_collection("categories")
            now = data.copy()
            res = coll.insert_one(now)
            doc = coll.find_one({"_id": res.inserted_id})
            return doc

        doc = await run_in_threadpool(_create)
        return _serialize_cat(doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating category: {str(e)}")


async def update_category(category_id: str, data: dict, user=None):
    try:
        def _update():
            coll = db.get_collection("categories")
            try:
                oid = ObjectId(category_id)
                coll.update_one({"_id": oid}, {"$set": data})
                return coll.find_one({"_id": oid})
            except Exception:
                coll.update_one({"slug": category_id}, {"$set": data})
                return coll.find_one({"slug": category_id})

        doc = await run_in_threadpool(_update)
        if not doc:
            raise HTTPException(status_code=404, detail="Category not found")
        return _serialize_cat(doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating category: {str(e)}")


async def delete_category(category_id: str, user=None):
    try:
        def _del():
            coll = db.get_collection("categories")
            try:
                return coll.find_one_and_delete({"_id": ObjectId(category_id)})
            except Exception:
                return coll.find_one_and_delete({"slug": category_id})

        deleted = await run_in_threadpool(_del)
        if not deleted:
            raise HTTPException(status_code=404, detail="Category not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting category: {str(e)}")
