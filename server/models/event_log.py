from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class EventLog(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    guest_id: str  # UUID for guest tracking
    event_type: str = Field(regex="^(page_view|add_to_cart|remove_from_cart|begin_checkout|purchase|add_to_wishlist|remove_from_wishlist)$")
    metadata: Optional[Dict[str, str]]  # Additional event metadata
    ip_address: Optional[str]
    created_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "guest_id": "guest123",
                "event_type": "page_view",
                "metadata": {
                    "productId": "prod123",
                    "cartValue": 100.0
                },
                "ip_address": "192.168.1.1",
                "created_at": "2026-03-10T12:00:00Z"
            }
        }