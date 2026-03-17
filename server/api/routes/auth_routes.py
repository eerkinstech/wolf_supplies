from fastapi import APIRouter, Depends, HTTPException
from controllers.auth_controller import (
    auth_user,
    get_user_profile,
    update_user_profile,
    get_admin_employees,
    get_employee_by_id,
    create_admin_employee,
    update_admin_employee,
    delete_admin_employee,
)
from middleware.auth_middleware import protect, admin

router = APIRouter()

# Only admin login is available (users login through admin login endpoint)
@router.post("/login")
async def login(data: dict):
    return await auth_user(data)

@router.get("/profile")
async def profile(user=Depends(protect)):
    return await get_user_profile(user)

@router.put("/profile")
async def update_profile(data: dict, user=Depends(protect)):
    return await update_user_profile(data, user)

# Employee management routes (admin only)
@router.get("/employees")
async def employees(user=Depends(admin)):
    return await get_admin_employees(user)

@router.get("/employees/{id}")
async def employee_by_id(id: str, user=Depends(admin)):
    return await get_employee_by_id(id, user)

@router.post("/employees")
async def create_employee(data: dict, user=Depends(admin)):
    return await create_admin_employee(data, user)

@router.put("/employees/{id}")
async def update_employee(id: str, data: dict, user=Depends(admin)):
    return await update_admin_employee(id, data, user)

@router.delete("/employees/{id}")
async def delete_employee(id: str, user=Depends(admin)):
    return await delete_admin_employee(id, user)