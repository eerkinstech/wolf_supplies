from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CartItem(BaseModel):
    product: Optional[str]  # Reference to Product ID
    name: Optional[str]
    quantity: int = Field(default=1)
    price: Optional[float]
    selected_variants: Optional[dict]
    image: Optional[str]

class Cart(BaseModel):
    user: Optional[str]  # Reference to User ID
    guest_id: Optional[str]  # UUID for guest tracking
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)