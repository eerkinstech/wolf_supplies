from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    email: EmailStr
    password: str
    plain_password: Optional[str] = None
    role: str = Field(default="user", regex="^(user|admin)$")
    custom_role: Optional[str]  # Reference to Role ID
    phone: Optional[str]
    address: Optional[str]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "password": "hashed_password",
                "role": "user",
                "phone": "123-456-7890",
                "address": "123 Main St",
            }
        }