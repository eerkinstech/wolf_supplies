from pymongo import MongoClient
import os
from bson import ObjectId
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Please set it in your .env file.")
client = MongoClient(DATABASE_URL)
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]

def _serialize(doc: dict):
    """Serialize MongoDB documents for JSON response"""
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

async def get_roles():
    """Get all roles"""
    try:
        coll = db.get_collection("roles")
        cursor = coll.find({}).sort("createdAt", -1)
        roles = [_serialize(r) for r in cursor]
        return {"roles": roles}
    except Exception as e:
        print("roles_controller.get_roles error:", type(e).__name__, repr(e))
        return {"roles": []}

async def get_role_by_id(role_id: str):
    """Get a single role by ID"""
    try:
        coll = db.get_collection("roles")
        role = coll.find_one({"_id": ObjectId(role_id)})
        return _serialize(role) if role else None
    except Exception as e:
        print("roles_controller.get_role_by_id error:", type(e).__name__, repr(e))
        return None

async def create_role(data: dict, user=None):
    """Create a new role"""
    try:
        coll = db.get_collection("roles")
        role_data = {
            "name": data.get("name"),
            "description": data.get("description", ""),
            "permissions": data.get("permissions", []),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "createdBy": user.get("_id") if user else None,
        }
        result = coll.insert_one(role_data)
        
        # Properly serialize the response
        created_by = role_data.get("createdBy")
        return {
            "_id": str(result.inserted_id),
            "name": role_data["name"],
            "description": role_data["description"],
            "permissions": role_data["permissions"],
            "createdAt": role_data["createdAt"].isoformat(),
            "updatedAt": role_data["updatedAt"].isoformat(),
            "createdBy": str(created_by) if created_by else None,
        }
    except Exception as e:
        print("roles_controller.create_role error:", type(e).__name__, repr(e))
        return None

async def update_role(role_id: str, data: dict, user=None):
    """Update an existing role"""
    try:
        coll = db.get_collection("roles")
        
        # Filter out None values
        update_data = {k: v for k, v in data.items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        update_data["updatedBy"] = user.get("_id") if user else None
        
        result = coll.find_one_and_update(
            {"_id": ObjectId(role_id)},
            {"$set": update_data},
            return_document=True
        )
        return _serialize(result) if result else None
    except Exception as e:
        print("roles_controller.update_role error:", type(e).__name__, repr(e))
        return None

async def delete_role(role_id: str, user=None):
    """Delete a role"""
    try:
        coll = db.get_collection("roles")
        result = coll.delete_one({"_id": ObjectId(role_id)})
        return {"deleted": result.deleted_count > 0}
    except Exception as e:
        print("roles_controller.delete_role error:", type(e).__name__, repr(e))
        return {"deleted": False}

async def get_permissions():
    """Get all available permissions"""
    # Default permissions if collection is empty or doesn't exist.
    # These are aligned with the admin sidebar/menu in the React app.
    # NOTE: We intentionally do NOT expose a permission for "Roles & Permissions"
    # so that only full admins (or your custom logic) can access that page.
    default_permissions = [
        # Main
        {"_id": "dashboard", "id": "dashboard", "name": "Dashboard", "label": "Dashboard", "description": "Access admin dashboard"},
        
        # Products & Inventory
        {"_id": "products", "id": "products", "name": "Products", "label": "Products", "description": "Manage products"},
        {"_id": "add-product", "id": "add-product", "name": "Add Product", "label": "Add Product", "description": "Add and edit products"},
        {"_id": "inventory", "id": "inventory", "name": "Inventory", "label": "Inventory", "description": "Manage stock and inventory"},
        {"_id": "categories", "id": "categories", "name": "Categories", "label": "Categories", "description": "Manage product categories"},
        {"_id": "collections", "id": "collections", "name": "Collections", "label": "Collections", "description": "Manage product collections"},

        # Media & Content
        {"_id": "media", "id": "media", "name": "Media Library", "label": "Media Library", "description": "Access media library"},
        {"_id": "menu", "id": "menu", "name": "Menu", "label": "Menu", "description": "Manage navigation menus"},
        {"_id": "sliders", "id": "sliders", "name": "Sliders", "label": "Sliders", "description": "Manage homepage sliders"},
        {"_id": "create-page", "id": "create-page", "name": "Create Page", "label": "Create Page", "description": "Create and edit pages"},

        # Sales & Orders
        {"_id": "orders", "id": "orders", "name": "Orders", "label": "Orders", "description": "View and manage orders"},
        {"_id": "customers", "id": "customers", "name": "Customers", "label": "Customers", "description": "View and manage customers"},
        {"_id": "coupons", "id": "coupons", "name": "Coupons", "label": "Coupons", "description": "Manage coupons and discounts"},

        # Engagement & Support
        {"_id": "reviews", "id": "reviews", "name": "Reviews", "label": "Reviews", "description": "Manage customer reviews"},
        {"_id": "chat", "id": "chat", "name": "Chat", "label": "Chat", "description": "Access support/chat system"},

        # Settings
        {"_id": "analytics", "id": "analytics", "name": "Analytics", "label": "Analytics", "description": "View analytics"},
        {"_id": "redirects", "id": "redirects", "name": "URL Redirects", "label": "URL Redirects", "description": "Manage URL redirects"},
        {"_id": "pages-seo", "id": "pages-seo", "name": "Pages & Policies SEO", "label": "Pages & Policies SEO", "description": "Manage SEO for pages & policies"},
    ]
    
    try:
        coll = db.get_collection("permissions")
        permissions = list(coll.find({}))
        # If database has permissions, return them serialized
        if permissions:
            return {"permissions": [_serialize(p) for p in permissions]}
        # Otherwise return defaults
        return {"permissions": default_permissions}
    except Exception as e:
        print("roles_controller.get_permissions error:", type(e).__name__, repr(e))
        # Return default permissions if there's any error
        return {"permissions": default_permissions}


async def ensure_default_employee_role():
    """Ensure the default 'Employee' role exists in the database"""
    try:
        coll = db.get_collection("roles")
        
        # Check if Employee role already exists
        existing_role = coll.find_one({"name": "Employee"})
        if existing_role:
            return existing_role
        
        # Create default Employee role with common permissions
        employee_role = {
            "name": "Employee",
            "description": "Default employee role with basic access",
            "permissions": [
                "dashboard",
                "products",
                "add-product",
                "orders",
                "customers",
                "inventory",
                "analytics",
                "categories",
                "collections",
                "media",
                "menu",
                "sliders",
                "create-page",
                "coupons",
                "reviews",
                "chat",
                "redirects",
                "pages-seo"
            ],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        
        result = coll.insert_one(employee_role)
        employee_role["_id"] = result.inserted_id
        print(f"✓ Default 'Employee' role created with ID: {result.inserted_id}")
        return employee_role
    except Exception as e:
        print(f"ensure_default_employee_role error: {type(e).__name__}: {repr(e)}")
        return None
