import sys
import os
from pathlib import Path

# Add server directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from pymongo import MongoClient
from bson.objectid import ObjectId
from fastapi import HTTPException
from typing import Optional, List
from datetime import datetime
from dotenv import load_dotenv
from database import db

# Load environment variables
load_dotenv()

# Set up file logging
LOG_FILE = Path(__file__).parent.parent / "redirect_debug.log"

def log_event(level, message):
    """Log events to both console and file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{timestamp}] [{level}] {message}"
    print(log_message)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(log_message + "\n")
    except:
        pass

# Get the redirects collection from our shared database connection
redirects_collection = db.get_collection("redirects")
log_event("INFO", f"redirectController initialized with collection: {redirects_collection}")

# Ensure unique index on fromUrl for duplicate prevention
try:
    redirects_collection.create_index("fromUrl", unique=True)
    log_event("INFO", "Unique index on fromUrl ensured")
except Exception as e:
    log_event("WARN", f"Could not create index on fromUrl: {e}")


def format_redirect(redirect_doc):
    """
    Helper function to format a redirect document for JSON response
    Converts ObjectId to string and dates to ISO format
    """
    if not redirect_doc:
        return None
    
    # Format dates to ISO format
    created_at = redirect_doc.get("createdAt")
    updated_at = redirect_doc.get("updatedAt")
    
    if created_at:
        created_at = created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)
    if updated_at:
        updated_at = updated_at.isoformat() if hasattr(updated_at, 'isoformat') else str(updated_at)
    
    return {
        "_id": str(redirect_doc.get("_id", "")),
        "fromUrl": redirect_doc.get("fromUrl", ""),
        "toUrl": redirect_doc.get("toUrl", ""),
        "isActive": redirect_doc.get("isActive", True),
        "createdAt": created_at,
        "updatedAt": updated_at
    }


async def get_all_redirects(is_active: Optional[bool] = None, search: Optional[str] = None):
    """
    Get all redirects with optional filtering and search
    """
    try:
        query = {}
        
        # Filter by active status
        if is_active is not None:
            query["isActive"] = is_active
        
        # Search in fromUrl or toUrl
        if search:
            query["$or"] = [
                {"fromUrl": {"$regex": search, "$options": "i"}},
                {"toUrl": {"$regex": search, "$options": "i"}}
            ]
        
        redirects = list(redirects_collection.find(query).sort("createdAt", -1))
        
        log_event("DEBUG", f"Found {len(redirects)} total redirects in DB")
        
        # Convert ObjectId to string for JSON serialization - filter out invalid records
        result = []
        for redirect in redirects:
            redirect_id = redirect.get("_id")
            from_url = redirect.get("fromUrl", "")
            to_url = redirect.get("toUrl", "")
            
            # Skip records with missing essential data
            if not redirect_id or not from_url or not to_url:
                log_event("WARN", f"Skipping invalid redirect record: _id={redirect_id}, fromUrl={from_url}, toUrl={to_url}")
                continue
            
            # Convert dates to ISO format for JSON serialization
            created_at = redirect.get("createdAt")
            updated_at = redirect.get("updatedAt")
            
            if created_at:
                created_at = created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)
            if updated_at:
                updated_at = updated_at.isoformat() if hasattr(updated_at, 'isoformat') else str(updated_at)
            
            redirect_dict = format_redirect(redirect)
            result.append(redirect_dict)
        
        log_event("DEBUG", f"Returning {len(result)} valid redirects after filtering")
        return result
    except Exception as e:
        log_event("ERROR", f"Error fetching redirects: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch redirects")


async def get_redirect_stats():
    """
    Get redirect statistics (total, active, inactive)
    """
    try:
        total = redirects_collection.count_documents({})
        active = redirects_collection.count_documents({"isActive": True})
        inactive = redirects_collection.count_documents({"isActive": False})
        
        return {
            "total": total,
            "active": active,
            "inactive": inactive
        }
    except Exception as e:
        print(f"Error fetching redirect stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")


async def get_redirect_by_id(redirect_id: str):
    """
    Get a single redirect by ID
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(redirect_id):
            raise HTTPException(status_code=400, detail="Invalid redirect ID")
        
        redirect = redirects_collection.find_one({"_id": ObjectId(redirect_id)})
        
        if not redirect:
            raise HTTPException(status_code=404, detail="Redirect not found")
        
        return format_redirect(redirect)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching redirect: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch redirect")


async def create_redirect(data: dict):
    """
    Create a new redirect
    """
    try:
        log_event("DEBUG", f"create_redirect called with data: {data}")
        log_event("DEBUG", f"Data type: {type(data)}")
        
        from_url = data.get("fromUrl", "").strip().lower()
        to_url = data.get("toUrl", "").strip().lower()
        is_active = data.get("isActive", True)
        
        log_event("DEBUG", f"Extracted - fromUrl: '{from_url}', toUrl: '{to_url}', isActive: {is_active}")
        
        # Validate required fields
        if not from_url or not to_url:
            log_event("WARN", "Missing required fields")
            raise HTTPException(status_code=400, detail="Both fromUrl and toUrl are required")
        
        # Ensure URLs start with /
        if not from_url.startswith("/"):
            from_url = "/" + from_url
        if not to_url.startswith("/"):
            to_url = "/" + to_url
        
        log_event("DEBUG", f"After normalization - fromUrl: '{from_url}', toUrl: '{to_url}'")
        
        # Check if redirect already exists
        existing = redirects_collection.find_one({"fromUrl": from_url})
        if existing:
            log_event("WARN", f"Redirect already exists for fromUrl: {from_url}")
            raise HTTPException(status_code=409, detail="A redirect for this URL already exists")
        
        # Create redirect document
        redirect_doc = {
            "fromUrl": from_url,
            "toUrl": to_url,
            "isActive": is_active,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        log_event("DEBUG", f"Attempting to insert: {redirect_doc}")
        
        # Insert into MongoDB
        result = redirects_collection.insert_one(redirect_doc)
        log_event("SUCCESS", f"Document inserted with ID: {result.inserted_id}")
        
        # Verify the insertion by reading it back
        verification = redirects_collection.find_one({"_id": result.inserted_id})
        if verification:
            log_event("VERIFY", f"Read back from DB: _id={verification.get('_id')}, fromUrl={verification.get('fromUrl')}")
            response_redirect = format_redirect(verification)
        else:
            log_event("ERROR", f"Failed to read back document after insert!")
            # Fallback if verification fails
            redirect_doc["_id"] = result.inserted_id
            response_redirect = format_redirect(redirect_doc)
        
        log_event("INFO", f"Returning response with redirect ID: {result.inserted_id}")
        
        return {
            "message": "Redirect created successfully",
            "redirect": response_redirect
        }
    except HTTPException as e:
        log_event("HTTP_ERROR", f"{e.status_code}: {e.detail}")
        raise e
    except Exception as e:
        log_event("ERROR", f"{type(e).__name__}: {e}")
        import traceback
        log_event("ERROR", traceback.format_exc())
        if "duplicate key error" in str(e).lower():
            raise HTTPException(status_code=409, detail="A redirect for this URL already exists")
        raise HTTPException(status_code=500, detail=str(e))


async def update_redirect(redirect_id: str, data: dict):
    """
    Update an existing redirect
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(redirect_id):
            raise HTTPException(status_code=400, detail="Invalid redirect ID")
        
        from_url = data.get("fromUrl", "").strip().lower()
        to_url = data.get("toUrl", "").strip().lower()
        is_active = data.get("isActive")
        
        # Validate required fields
        if not from_url or not to_url:
            raise HTTPException(status_code=400, detail="Both fromUrl and toUrl are required")
        
        # Ensure URLs start with /
        if not from_url.startswith("/"):
            from_url = "/" + from_url
        if not to_url.startswith("/"):
            to_url = "/" + to_url
        
        # Check if the new fromUrl is already used by another redirect
        existing = redirects_collection.find_one({
            "fromUrl": from_url,
            "_id": {"$ne": ObjectId(redirect_id)}
        })
        if existing:
            raise HTTPException(status_code=409, detail="A redirect for this URL already exists")
        
        # Prepare update data
        update_data = {
            "fromUrl": from_url,
            "toUrl": to_url,
            "updatedAt": datetime.utcnow()
        }
        
        # Only update isActive if provided
        if is_active is not None:
            update_data["isActive"] = is_active
        
        # Update redirect
        result = redirects_collection.find_one_and_update(
            {"_id": ObjectId(redirect_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Redirect not found")
        
        response_redirect = {
            "_id": str(result.get("_id", "")),
            "fromUrl": result.get("fromUrl", ""),
            "toUrl": result.get("toUrl", ""),
            "isActive": result.get("isActive", True),
            "createdAt": result.get("createdAt"),
            "updatedAt": result.get("updatedAt")
        }
        return {
            "message": "Redirect updated successfully",
            "redirect": response_redirect
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error updating redirect: {e}")
        if "duplicate key error" in str(e).lower():
            raise HTTPException(status_code=409, detail="A redirect for this URL already exists")
        raise HTTPException(status_code=500, detail="Failed to update redirect")


async def delete_redirect(redirect_id: str):
    """
    Delete a single redirect
    """
    try:
        print(f"[DEBUG] Attempting to delete redirect with ID: {redirect_id}")
        
        # Validate ObjectId
        if not redirect_id or redirect_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid redirect ID - no ID provided")
        
        if not ObjectId.is_valid(redirect_id):
            raise HTTPException(status_code=400, detail=f"Invalid redirect ID format: {redirect_id}")
        
        print(f"[DEBUG] Converting ID to ObjectId: {redirect_id}")
        object_id = ObjectId(redirect_id)
        
        result = redirects_collection.find_one_and_delete({"_id": object_id})
        
        print(f"[DEBUG] Delete result: {result}")
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Redirect not found with ID: {redirect_id}")
        
        response_redirect = {
            "_id": str(result.get("_id", "")),
            "fromUrl": result.get("fromUrl", ""),
            "toUrl": result.get("toUrl", ""),
            "isActive": result.get("isActive", True),
            "createdAt": result.get("createdAt"),
            "updatedAt": result.get("updatedAt")
        }
        print(f"[DEBUG] Successfully deleted redirect: {response_redirect}")
        return {
            "message": "Redirect deleted successfully",
            "redirect": response_redirect
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Error deleting redirect: {e}, Type: {type(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete redirect: {str(e)}")


async def bulk_delete_redirects(ids: List[str]):
    """
    Bulk delete multiple redirects
    """
    try:
        # Filter out empty or None IDs
        ids = [id_str for id_str in ids if id_str and id_str.strip()]
        
        if not ids or len(ids) == 0:
            raise HTTPException(status_code=400, detail="No redirect IDs provided")
        
        # Validate all IDs
        object_ids = []
        for id_str in ids:
            if not ObjectId.is_valid(id_str):
                print(f"Invalid ID format: {id_str}")
                raise HTTPException(status_code=400, detail=f"Invalid redirect ID format: {id_str}")
            object_ids.append(ObjectId(id_str))
        
        result = redirects_collection.delete_many({"_id": {"$in": object_ids}})
        
        return {
            "message": f"{result.deleted_count} redirect(s) deleted successfully",
            "deletedCount": result.deleted_count
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error bulk deleting redirects: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete redirects")


async def toggle_redirect_status(redirect_id: str):
    """
    Toggle redirect status (active/inactive)
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(redirect_id):
            raise HTTPException(status_code=400, detail="Invalid redirect ID")
        
        # Get current redirect
        redirect = redirects_collection.find_one({"_id": ObjectId(redirect_id)})
        
        if not redirect:
            raise HTTPException(status_code=404, detail="Redirect not found")
        
        # Toggle status
        new_status = not redirect.get("isActive", True)
        
        result = redirects_collection.find_one_and_update(
            {"_id": ObjectId(redirect_id)},
            {"$set": {"isActive": new_status, "updatedAt": datetime.utcnow()}},
            return_document=True
        )
        
        response_redirect = {
            "_id": str(result.get("_id", "")),
            "fromUrl": result.get("fromUrl", ""),
            "toUrl": result.get("toUrl", ""),
            "isActive": result.get("isActive", True),
            "createdAt": result.get("createdAt"),
            "updatedAt": result.get("updatedAt")
        }
        return {
            "message": f"Redirect is now {'active' if new_status else 'inactive'}",
            "redirect": response_redirect
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error toggling redirect status: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle redirect status")


async def resolve_redirect(from_url: str):
    """
    Resolve redirect (public endpoint - find where to redirect a URL)
    Frontend expects: { found: true, redirect: { to: "...", from: "..." } }
    """
    try:
        if not from_url:
            return {"found": False, "message": "URL parameter is required"}
        
        # Normalize URL
        from_url = from_url.lower().strip()
        if not from_url.startswith("/"):
            from_url = "/" + from_url
        
        log_event("DEBUG", f"Resolving redirect for URL: {from_url}")
        
        # Find active redirect
        redirect = redirects_collection.find_one({
            "fromUrl": from_url,
            "isActive": True
        })
        
        if not redirect:
            log_event("DEBUG", f"No redirect found for URL: {from_url}")
            return {"found": False, "message": "No active redirect found for this URL"}
        
        to_url = redirect.get("toUrl", "")
        log_event("INFO", f"Redirect found: {from_url} → {to_url}")
        
        return {
            "found": True,
            "redirect": {
                "from": from_url,
                "to": to_url
            }
        }
    except Exception as e:
        log_event("ERROR", f"Error resolving redirect: {e}")
        return {"found": False, "error": str(e)}


async def search_redirects(q: str):
    """
    Search redirects
    """
    try:
        if not q:
            raise HTTPException(status_code=400, detail="Search query is required")
        
        results = list(redirects_collection.find({
            "$or": [
                {"fromUrl": {"$regex": q, "$options": "i"}},
                {"toUrl": {"$regex": q, "$options": "i"}}
            ]
        }).limit(10))
        
        # Convert ObjectId to string and format properly
        formatted_results = []
        for result in results:
            formatted_result = {
                "_id": str(result.get("_id", "")),
                "fromUrl": result.get("fromUrl", ""),
                "toUrl": result.get("toUrl", ""),
                "isActive": result.get("isActive", True),
                "createdAt": result.get("createdAt"),
                "updatedAt": result.get("updatedAt")
            }
            formatted_results.append(formatted_result)
        
        return formatted_results
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error searching redirects: {e}")
        raise HTTPException(status_code=500, detail="Failed to search redirects")