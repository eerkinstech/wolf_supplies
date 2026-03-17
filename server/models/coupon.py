from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Coupon(BaseModel):
    id: Optional[str]  # MongoDB ObjectId
    code: str
    description: Optional[str]
    discount_type: str  # 'percentage' or 'fixed'
    discount_value: float
    product_id: Optional[str]  # Reference to Product ID
    max_uses: Optional[int]
    current_uses: int = 0
    valid_from: Optional[datetime]
    valid_until: Optional[datetime]
    is_active: bool = True
    minimum_order_value: float = 0.0
    created_by: Optional[str]  # Reference to User ID
    created_at: datetime = Field(default_factory=datetime.utcnow)