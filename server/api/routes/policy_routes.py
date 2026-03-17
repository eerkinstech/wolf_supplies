from fastapi import APIRouter, Depends, Body
from controllers.policy_controller import (
    get_policies,
    get_policy_by_id,
    create_policy,
    update_policy,
    delete_policy
)
from middleware.auth_middleware import protect, admin

router = APIRouter()

@router.get("/")
async def fetch_policies():
    """Get all policies"""
    try:
        policies = await get_policies()
        return {"policies": policies}
    except Exception as e:
        print(f"Error fetching policies: {e}")
        return {"policies": []}

@router.get("")
async def fetch_policies_no_slash():
    """Get all policies (no trailing slash)"""
    try:
        policies = await get_policies()
        return {"policies": policies}
    except Exception as e:
        print(f"Error fetching policies: {e}")
        return {"policies": []}

@router.get("/{policy_id}")
async def fetch_policy_by_id(policy_id: str):
    """Get a single policy by ID"""
    try:
        policy = await get_policy_by_id(policy_id)
        return policy if policy else {"error": "Policy not found"}
    except Exception as e:
        print(f"Error fetching policy: {e}")
        return {"error": str(e)}

@router.post("/")
async def add_policy(data: dict = Body(...), user=Depends(admin)):
    """Create a new policy"""
    try:
        policy = await create_policy(data, user)
        return policy
    except Exception as e:
        print(f"Error creating policy: {e}")
        return {"error": str(e)}

@router.post("")
async def add_policy_no_slash(data: dict = Body(...), user=Depends(admin)):
    """Create a new policy (no trailing slash)"""
    try:
        policy = await create_policy(data, user)
        return policy
    except Exception as e:
        print(f"Error creating policy: {e}")
        return {"error": str(e)}

@router.put("/{policy_id}")
async def modify_policy(policy_id: str, data: dict = Body(...), user=Depends(admin)):
    """Update a policy"""
    try:
        policy = await update_policy(policy_id, data, user)
        return policy
    except Exception as e:
        print(f"Error updating policy: {e}")
        return {"error": str(e)}

@router.delete("/{policy_id}")
async def remove_policy(policy_id: str, user=Depends(admin)):
    """Delete a policy"""
    try:
        result = await delete_policy(policy_id, user)
        return result
    except Exception as e:
        print(f"Error deleting policy: {e}")
        return {"error": str(e)}