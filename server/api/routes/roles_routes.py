from fastapi import APIRouter, Depends, Body
from controllers.roles_controller import (
    get_roles,
    create_role,
    update_role,
    delete_role,
    get_permissions
)
from middleware.auth_middleware import protect, admin

router = APIRouter()

@router.get("/")
async def fetch_roles():
    """Get all roles"""
    try:
        roles = await get_roles()
        return roles if isinstance(roles, dict) and "roles" in roles else {"roles": roles}
    except Exception as e:
        print(f"Error fetching roles: {e}")
        return {"roles": []}

@router.get("")
async def fetch_roles_no_slash():
    """Get all roles (no trailing slash)"""
    try:
        roles = await get_roles()
        return roles if isinstance(roles, dict) and "roles" in roles else {"roles": roles}
    except Exception as e:
        print(f"Error fetching roles: {e}")
        return {"roles": []}

@router.get("/permissions")
async def fetch_permissions():
    """Get all available permissions"""
    try:
        permissions = await get_permissions()
        return permissions if isinstance(permissions, dict) and "permissions" in permissions else {"permissions": permissions}
    except Exception as e:
        print(f"Error fetching permissions: {e}")
        return {"permissions": []}

@router.post("/")
async def add_role(data: dict = Body(...), user=Depends(admin)):
    """Create a new role"""
    try:
        role = await create_role(data, user)
        return role if role else {"error": "Failed to create role"}
    except Exception as e:
        print(f"Error creating role: {e}")
        return {"error": str(e)}

@router.post("")
async def add_role_no_slash(data: dict = Body(...), user=Depends(admin)):
    """Create a new role (no trailing slash)"""
    return await add_role(data, user)

@router.put("/{role_id}")
async def modify_role(role_id: str, data: dict = Body(...), user=Depends(admin)):
    """Update an existing role"""
    try:
        role = await update_role(role_id, data, user)
        return role if role else {"error": "Role not found"}
    except Exception as e:
        print(f"Error updating role: {e}")
        return {"error": str(e)}

@router.delete("/{role_id}")
async def remove_role(role_id: str, user=Depends(admin)):
    """Delete a role"""
    try:
        result = await delete_role(role_id, user)
        return result
    except Exception as e:
        print(f"Error deleting role: {e}")
        return {"error": str(e), "deleted": False}