from fastapi import HTTPException
from server.models.user import User
from server.utils.generate_token import generate_token

# @desc    Auth user & get token
# @route   POST /api/users/login
# @access  Public
async def auth_user(data: dict):
    from server.models.user import User
    from bson import ObjectId
    
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=401, detail="Email and password are required")

    user = await User.find_one({"email": email})
    if not user or not user.match_password(password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Guarantee role is 'admin' if user is admin
    role = 'admin' if getattr(user, 'isAdmin', False) or user.role == 'admin' else user.role
    is_admin = getattr(user, 'isAdmin', False) or user.role == 'admin'
    
    print(f"[AUTH] User {email}: role={role}, isAdmin={is_admin}")
    
    # Get custom role and permissions if user has them
    custom_role = None
    permissions = []
    
    if hasattr(user, 'customRole') and user.customRole:
        custom_role = user.customRole
        print(f"[AUTH] User already has customRole: {custom_role.get('name') if isinstance(custom_role, dict) else custom_role}")
        if isinstance(custom_role, dict):
            permissions = custom_role.get("permissions", [])
    else:
        # If user is an employee without a role, try to assign default "Employee" role
        if role == 'employee' and not is_admin:
            print(f"[AUTH] Employee {email} has no role, attempting to assign default Employee role...")
            from database import db
            roles_coll = db.get_collection("roles")
            default_role = roles_coll.find_one({"name": "Employee"})
            
            if default_role:
                print(f"[AUTH] Found Employee role: {default_role.get('_id')}")
                custom_role = {
                    "id": str(default_role.get("_id")),
                    "name": default_role.get("name"),
                    "permissions": default_role.get("permissions", []),
                }
                permissions = custom_role.get("permissions", [])
                
                # Update user document in database with the default role
                users_coll = db.get_collection("users")
                try:
                    user_id = ObjectId(str(user.id))
                    print(f"[AUTH] Updating user {email} with custom role...")
                    result = users_coll.update_one(
                        {"_id": user_id},
                        {"$set": {"customRole": custom_role}}
                    )
                    print(f"[AUTH] ✓ Updated {result.modified_count} document(s)")
                except Exception as e:
                    print(f"[AUTH] Error updating user: {type(e).__name__}: {e}")
            else:
                print(f"[AUTH] ERROR: Employee role not found in database!")
    
    response = {
        "_id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": getattr(user, 'phone', ''),
        "role": role,
        "isAdmin": is_admin,
        "customRole": custom_role,
        "permissions": permissions,
        "token": generate_token(user.id),
    }
    
    print(f"[AUTH] Login response for {email}: customRole={custom_role is not None}, permissions={len(permissions)}")
    
    return response

# @desc    Get user profile
# @route   GET /api/users/profile
# @access  Private
async def get_user_profile(user):
    role = 'admin' if getattr(user, 'isAdmin', False) or user.role == 'admin' else user.role
    is_admin = getattr(user, 'isAdmin', False) or user.role == 'admin'
    
    # Get custom role and permissions if user has them
    custom_role = None
    permissions = []
    if hasattr(user, 'customRole') and user.customRole:
        custom_role = user.customRole
        if isinstance(custom_role, dict):
            permissions = custom_role.get("permissions", [])
    
    return {
        "_id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": role,
        "isAdmin": is_admin,
        "customRole": custom_role,
        "permissions": permissions,
    }

# @desc    Update user profile
# @route   PUT /api/users/profile
# @access  Private
async def update_user_profile(data: dict, user):
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)
    if "password" in data:
        user.password = data["password"]
    await user.save()
    return {
        "_id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
    }

# ============= EMPLOYEE MANAGEMENT =============

async def get_admin_employees(user):
    """Get all employees - admin only"""
    try:
        from server.models.user import User
        from bson import ObjectId
        
        # Get all users that are not the current admin user
        employees = await User.find({"_id": {"$ne": ObjectId(user.get("_id", ""))}})
        
        result = []
        for emp in employees:
            result.append({
                "_id": str(emp.id),
                "name": emp.name,
                "email": emp.email,
                "phone": getattr(emp, "phone", ""),
                "role": emp.role,
                "isAdmin": getattr(emp, "isAdmin", False),
                "customRole": str(getattr(emp, "customRole", "")) if getattr(emp, "customRole", None) else None,
                "createdAt": getattr(emp, "createdAt", None),
            })
        
        return {"employees": result}
    except Exception as e:
        print(f"get_admin_employees error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_employee_by_id(employee_id: str, user):
    """Get single employee by ID - admin only"""
    try:
        from server.models.user import User
        from bson import ObjectId
        
        emp = await User.find_one({"_id": ObjectId(employee_id)})
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        return {
            "_id": str(emp.id),
            "name": emp.name,
            "email": emp.email,
            "phone": getattr(emp, "phone", ""),
            "role": emp.role,
            "isAdmin": getattr(emp, "isAdmin", False),
            "customRole": str(getattr(emp, "customRole", "")) if getattr(emp, "customRole", None) else None,
        }
    except Exception as e:
        print(f"get_employee_by_id error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def create_admin_employee(data: dict, user):
    """Create new employee - admin only"""
    try:
        from server.models.user import User
        
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        phone = data.get("phone", "")
        custom_role = data.get("customRole")
        
        if not name or not email or not password:
            raise HTTPException(status_code=400, detail="Name, email, and password are required")
        
        # Check if email already exists
        existing = await User.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Create new user
        new_employee = User(
            name=name,
            email=email,
            phone=phone,
            password=password,
            role="employee",
            isAdmin=False,
            customRole=custom_role if custom_role else None,
        )
        
        await new_employee.save()
        
        return {
            "_id": str(new_employee.id),
            "name": new_employee.name,
            "email": new_employee.email,
            "phone": phone,
            "role": "employee",
            "isAdmin": False,
            "customRole": custom_role,
            "message": "Employee created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"create_admin_employee error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def update_admin_employee(employee_id: str, data: dict, user):
    """Update existing employee - admin only"""
    try:
        from server.models.user import User
        from bson import ObjectId
        
        emp = await User.find_one({"_id": ObjectId(employee_id)})
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Update fields
        if "name" in data:
            emp.name = data["name"]
        if "email" in data:
            emp.email = data["email"]
        if "phone" in data:
            emp.phone = data["phone"]
        if "password" in data and data["password"].strip():
            emp.password = data["password"]
        if "customRole" in data:
            emp.customRole = data["customRole"] if data["customRole"] else None
        
        await emp.save()
        
        return {
            "_id": str(emp.id),
            "name": emp.name,
            "email": emp.email,
            "phone": getattr(emp, "phone", ""),
            "role": emp.role,
            "customRole": str(getattr(emp, "customRole", "")) if getattr(emp, "customRole", None) else None,
            "message": "Employee updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"update_admin_employee error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def delete_admin_employee(employee_id: str, user):
    """Delete employee - admin only"""
    try:
        from server.models.user import User
        from bson import ObjectId
        
        emp = await User.find_one({"_id": ObjectId(employee_id)})
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        await emp.delete()
        
        return {
            "message": "Employee deleted successfully",
            "deleted": True
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"delete_admin_employee error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))