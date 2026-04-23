from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os
from typing import Optional

from database import db

async def get_user_by_id(user_id: str):
    from bson import ObjectId
    if not user_id:
        return None

    user_id = str(user_id)
    queries = []

    try:
        queries.append({'_id': ObjectId(user_id)})
    except Exception:
        pass

    queries.extend([
        {'_id': user_id},
        {'id': user_id},
    ])

    user = None
    for query in queries:
        user = db.users.find_one(query)
        if user:
            break

    if not user:
        return None

    return {
        'id': str(user.get('_id')),
        'role': user.get('role'),
        'isAdmin': user.get('isAdmin', False),
        'customRole': user.get('customRole')
    }

def decode_token(token: str):
    secrets = [
        os.getenv("JWT_SECRET"),
        "eerkinstech",
        "changeme",
    ]

    last_error = None
    for secret in dict.fromkeys(secret for secret in secrets if secret):
        try:
            return jwt.decode(token, secret, algorithms=["HS256"])
        except JWTError as error:
            last_error = error

    raise last_error or JWTError("Token verification failed")

# Middleware for token-based authentication
# Use auto_error=False to handle missing token ourselves
security = HTTPBearer(auto_error=False)

async def protect(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)):
    # Check if credentials were provided
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("id") or payload.get("_id") or payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token verification failed")

async def admin(user: dict = Depends(protect)):
    # Allow access if user is admin by role or isAdmin flag
    if user.get("role") == "admin" or user.get("isAdmin") is True:
        return user
    raise HTTPException(status_code=403, detail="Not authorized. Admin access required")

async def require_permission(permission: str):
    """
    Factory function that returns a dependency for checking if user has a specific permission.
    Usage: @router.get("/some-endpoint", dependencies=[Depends(require_permission("read_reports"))])
    """
    async def check_permission(user: dict = Depends(protect)):
        # Admins always have access
        if user.get("role") == "admin" or user.get("isAdmin") is True:
            return user
        
        # Check if user has the required permission via their custom role
        custom_role = user.get("customRole")
        if custom_role and isinstance(custom_role, dict):
            permissions = custom_role.get("permissions", [])
            # Check if permission exists in the role's permissions
            if any(p.get("_id") == permission or p == permission for p in permissions):
                return user
        
        raise HTTPException(
            status_code=403, 
            detail=f"You don't have permission for this action. Required: {permission}"
        )
    
    return check_permission
