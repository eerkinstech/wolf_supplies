from fastapi import APIRouter, HTTPException
from models.role import Role
from models.user import User
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class RoleResponse(BaseModel):
    name: str
    description: Optional[str]
    permissions: List[str]

@router.get("/roles", response_model=List[RoleResponse])
async def get_roles():
    try:
        roles = await Role.find().to_list(length=None)
        return roles
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching roles")

@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role_by_id(role_id: str):
    try:
        role = await Role.find_one({"_id": role_id})
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return role
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching role")
