from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime

class WishlistItem(BaseModel):
    product: str  # Reference to Product ID
    snapshot: Optional[dict] = None
    added_at: Optional[datetime] = None

    class Config:
        schema_extra = {
            "example": {
                "product": "product_id",
                "snapshot": {"name": "Product Name", "price": 100.0},
                "added_at": "2026-03-10T12:00:00Z"
            }
        }

class Wishlist(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user: Optional[str] = None  # Reference to User ID
    guest_id: Optional[str] = None  # UUID for guest tracking
    items: List[WishlistItem] = []
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "user": "user_id",
                "guest_id": "guest123",
                "items": [
                    {
                        "product": "product_id",
                        "snapshot": {"name": "Product Name", "price": 100.0},
                        "added_at": "2026-03-10T12:00:00Z"
                    }
                ],
                "updated_at": "2026-03-10T12:00:00Z"
            }
        }