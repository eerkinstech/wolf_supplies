from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Redirect(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    from_url: str
    to_url: str
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "from_url": "/old-product-name",
                "to_url": "/new-product-name",
                "is_active": True
            }
        }