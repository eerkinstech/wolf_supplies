from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Role(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: Optional[str] = ""
    permissions: List[str] = []
    is_system: bool = False
    created_by: Optional[str] = None  # Reference to User
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "name": "Admin",
                "description": "Administrator role with full permissions",
                "permissions": ["dashboard", "products", "categories"],
                "is_system": True,
                "created_by": "user_id"
            }
        }