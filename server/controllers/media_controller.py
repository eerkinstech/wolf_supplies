from fastapi import HTTPException, UploadFile, File
from typing import Optional
from pymongo import MongoClient
import os
from bson import ObjectId
from starlette.concurrency import run_in_threadpool
import shutil
from datetime import datetime
import uuid

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Please set it in your .env file.")
client = MongoClient(DATABASE_URL)
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]

# Upload media
async def upload_media(file: UploadFile = File(...)):
    try:
        mime = file.content_type
        print(f"[upload_media] Uploading file: {file.filename}, mime: {mime}")
        
        if mime not in [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
            "video/mp4",
            "video/webm",
            "video/ogg",
        ]:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        # Determine asset type
        asset_type = "image" if mime.startswith("image") else "video"

        # Create uploads directory if it doesn't exist
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
            print(f"[upload_media] Created uploads directory: {uploads_dir}")

        # Generate unique filename to avoid collisions
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(uploads_dir, unique_filename)

        # Save file to disk
        print(f"[upload_media] Saving file to: {file_path}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Create media document for database
        media_doc = {
            "filename": file.filename,
            "storage_filename": unique_filename,
            "mime": mime,
            "type": asset_type,
            "storage_key_or_path": f"uploads/{unique_filename}",
            "url": f"/api/media/serve/{unique_filename}",
            "created_at": datetime.utcnow().isoformat(),
        }

        # Save to MongoDB
        coll = db.get_collection("media")
        result = coll.insert_one(media_doc)
        media_doc["_id"] = str(result.inserted_id)

        print(f"[upload_media] File saved successfully: {unique_filename}")
        return {
            "success": True,
            "filename": unique_filename,
            "original_filename": file.filename,
            "type": asset_type,
            "url": f"/uploads/{unique_filename}",
            "_id": str(result.inserted_id),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[upload_media] Error: {type(e).__name__}: {repr(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error uploading media: {str(e)}")


async def get_media_list(page: int = 1, limit: int = 24, search: Optional[str] = None, type: Optional[str] = None, all: bool = False):
    try:
        def _fetch():
            coll = db.get_collection("media")
            q = {}
            if search:
                q["filename"] = {"$regex": search, "$options": "i"}
            if type:
                q["type"] = type
            total = coll.count_documents(q)
            cursor = coll.find(q).sort("created_at", -1)
            if not all:
                cursor = cursor.skip((page - 1) * limit).limit(limit)
            assets = []
            for a in cursor:
                a["_id"] = str(a.get("_id"))
                assets.append(a)
            pages = 1 if all else ((total + limit - 1) // limit)
            return {
                "assets": assets,
                "pagination": {
                    "page": 1 if all else page,
                    "pages": pages,
                    "total": total,
                    "limit": total if all else limit,
                },
            }

        result = await run_in_threadpool(_fetch)
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching media: {str(e)}")


async def delete_media(media_id: str):
    try:
        def _del():
            coll = db.get_collection("media")
            res = coll.find_one_and_delete({"_id": ObjectId(media_id)})
            return res

        deleted = await run_in_threadpool(_del)
        if not deleted:
            raise HTTPException(status_code=404, detail="Media not found")
        # attempt to remove file from uploads if present
        try:
            filename = os.path.basename(deleted.get("storage_key_or_path", ""))
            uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
            file_path = os.path.abspath(os.path.join(uploads_dir, filename))
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting media: {str(e)}")
