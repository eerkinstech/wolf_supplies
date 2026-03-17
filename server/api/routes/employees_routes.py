from fastapi import APIRouter, Body, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from database import db
from middleware.auth_middleware import admin, protect


router = APIRouter()


async def employee_manager(user: dict = Depends(protect)):
  """
  Allow access for:
  1. Admin users
  2. Employees with custom role having 'manage_employees' permission or 'manage_roles' permission
  """
  # Allow admins
  if user.get("role") == "admin" or user.get("isAdmin") is True:
    return user
  
  # Allow employees with the manage_employees or manage_roles permission
  custom_role = user.get("customRole")
  if custom_role and isinstance(custom_role, dict):
    permissions = custom_role.get("permissions", [])
    # Check if they have management permissions
    permission_names = [p.get("name") if isinstance(p, dict) else str(p) for p in permissions]
    if "manage_employees" in permission_names or "manage_roles" in permission_names:
      return user
  
  raise HTTPException(status_code=403, detail="You don't have permission to manage employees")



def _serialize(doc: dict):
  if doc is None:
    return None

  def _walk(o):
    from bson import ObjectId as _ObjectId
    from datetime import datetime as _Datetime

    if isinstance(o, _ObjectId):
      return str(o)
    if isinstance(o, _Datetime):
      return o.isoformat()
    if isinstance(o, dict):
      return {k: _walk(v) for k, v in o.items()}
    if isinstance(o, list):
      return [_walk(i) for i in o]
    return o

  return _walk(doc)


def _build_custom_role(role_id: str | None):
  """Given a role _id (string), return embedded customRole object or None."""
  if not role_id:
    return None
  try:
    obj_id = ObjectId(role_id)
  except Exception:
    return None

  role = db.get_collection("roles").find_one({"_id": obj_id})
  if not role:
    return None

  return {
    "id": str(role.get("_id")),
    "name": role.get("name"),
    "permissions": role.get("permissions", []),
  }


@router.get("/")
async def list_employees(user=Depends(employee_manager)):
  """
  List all employees (non-admin users).
  Employees are users that either:
  - have a customRole set, or
  - have role different from 'admin' and isAdmin == False.
  """
  coll = db.get_collection("users")

  cursor = coll.find(
    {
      "$or": [
        {"customRole": {"$ne": None}},
        {"role": {"$ne": "admin"}, "isAdmin": {"$ne": True}},
      ]
    }
  ).sort("createdAt", -1)

  employees = [_serialize(u) for u in cursor]
  return {"employees": employees}


@router.get("")
async def list_employees_no_slash(user=Depends(employee_manager)):
  """Get all employees (no trailing slash)."""
  return await list_employees(user)


@router.post("/")
async def create_employee(data: dict = Body(...), user=Depends(employee_manager)):
  """
  Create a new employee user.
  Expects: name, email, password, phone, customRole (role _id string, optional).
  If no role is provided, auto-assigns the default "Employee" role.
  """
  name = (data.get("name") or "").strip()
  email = (data.get("email") or "").strip().lower()
  password = (data.get("password") or "").strip()
  phone = (data.get("phone") or "").strip()
  custom_role_id = (data.get("customRole") or "").strip()

  if not name:
    raise HTTPException(status_code=400, detail="Employee name is required")
  if not email:
    raise HTTPException(status_code=400, detail="Email is required")
  if not password:
    raise HTTPException(status_code=400, detail="Password is required")

  coll = db.get_collection("users")

  # Ensure email is unique
  if coll.find_one({"email": email}):
    raise HTTPException(status_code=400, detail="Email already in use")

  # Build custom role - if none provided, try to auto-assign default "Employee" role
  embedded_custom_role = None
  if custom_role_id:
    embedded_custom_role = _build_custom_role(custom_role_id)
  else:
    # Try to find default "Employee" role
    roles_coll = db.get_collection("roles")
    default_role = roles_coll.find_one({"name": "Employee"})
    if default_role:
      embedded_custom_role = {
        "id": str(default_role.get("_id")),
        "name": default_role.get("name"),
        "permissions": default_role.get("permissions", []),
      }

  now = datetime.utcnow()
  employee_doc = {
    "name": name,
    "email": email,
    "password": password,  # login supports plaintext or bcrypt
    "phone": phone,
    "role": "employee",
    "isAdmin": False,
    "customRole": embedded_custom_role,
    "createdAt": now,
    "updatedAt": now,
    "createdBy": user.get("id") if isinstance(user, dict) else None,
  }

  result = coll.insert_one(employee_doc)
  employee_doc["_id"] = result.inserted_id
  return _serialize(employee_doc)


@router.post("")
async def create_employee_no_slash(data: dict = Body(...), user=Depends(employee_manager)):
  """Create employee (no trailing slash)."""
  return await create_employee(data, user)


@router.put("/{employee_id}")
async def update_employee(employee_id: str, data: dict = Body(...), user=Depends(employee_manager)):
  """
  Update an existing employee.
  Allows updating: name, email, phone, password (optional), customRole (role _id string).
  """
  try:
    obj_id = ObjectId(employee_id)
  except Exception:
    raise HTTPException(status_code=400, detail="Invalid employee id")

  coll = db.get_collection("users")

  update_data: dict = {}

  if "name" in data:
    update_data["name"] = (data["name"] or "").strip()
  if "email" in data:
    update_data["email"] = (data["email"] or "").strip().lower()
  if "phone" in data:
    update_data["phone"] = (data["phone"] or "").strip()
  if "password" in data and data["password"]:
    # Only update password if non-empty string provided
    update_data["password"] = (data["password"] or "").strip()
  if "customRole" in data:
    custom_role_id = (data.get("customRole") or "").strip()
    update_data["customRole"] = _build_custom_role(custom_role_id) if custom_role_id else None

  if not update_data:
    raise HTTPException(status_code=400, detail="No valid fields to update")

  update_data["updatedAt"] = datetime.utcnow()
  update_data["updatedBy"] = user.get("id") if isinstance(user, dict) else None

  result = coll.find_one_and_update(
    {"_id": obj_id},
    {"$set": update_data},
    return_document=True,
  )

  if not result:
    raise HTTPException(status_code=404, detail="Employee not found")

  return _serialize(result)


@router.delete("/{employee_id}")
async def delete_employee(employee_id: str, user=Depends(employee_manager)):
  """Delete an employee user."""
  try:
    obj_id = ObjectId(employee_id)
  except Exception:
    raise HTTPException(status_code=400, detail="Invalid employee id")

  coll = db.get_collection("users")

  result = coll.delete_one({"_id": obj_id})
  if result.deleted_count == 0:
    raise HTTPException(status_code=404, detail="Employee not found")

  return {"deleted": True}


@router.get("/dashboard/access")
async def get_employee_dashboard_access(user=Depends(protect)):
  """
  Get accessible pages/sections for the logged-in user based on their role and permissions.
  Admins have access to all sections. Employees see sections based on their custom role permissions.
  """
  is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
  
  # Admin dashboard - full access to all pages
  if is_admin:
    return {
      "isAdmin": True,
      "roleName": None,
      "canAccess": [
        "dashboard",
        "products",
        "add-product",
        "orders",
        "customers",
        "employees",
        "roles",
        "analytics",
        "categories",
        "collections",
        "media",
        "inventory",
        "menu",
        "sliders",
        "chat",
        "reviews",
        "coupons",
        "redirects",
        "pages-seo",
        "create-page",
      ],
      "permissions": [],
      "message": "Welcome Admin"
    }
  
  # Employee dashboard - based on permissions
  custom_role = user.get("customRole")
  if not custom_role:
    raise HTTPException(
      status_code=403, 
      detail="You are not assigned a role yet. Please contact your administrator."
    )
  
  # Extract permission IDs from customRole
  # Permissions can be either strings or objects with "name" property
  permissions = custom_role.get("permissions", [])
  permission_ids = []
  
  for perm in permissions:
    if isinstance(perm, dict):
      # If it's a dict with "_id" or "id" or "name" field
      perm_id = perm.get("_id") or perm.get("id") or perm.get("name")
      if perm_id:
        permission_ids.append(perm_id)
    elif isinstance(perm, str):
      # If it's already a string ID
      permission_ids.append(perm)
  
  # The accessible pages are directly the permission IDs
  # since permission IDs match the page identifiers
  accessible_pages = permission_ids
  
  return {
    "isAdmin": False,
    "roleName": custom_role.get("name"),
    "canAccess": accessible_pages,
    "permissions": permission_ids,
    "message": f"Welcome {custom_role.get('name')} user"
  }


