from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class OrderItem(BaseModel):
    name: Optional[str]
    qty: Optional[int]
    price: Optional[float]
    product: Optional[str]  # Reference to Product ID
    image: Optional[str]
    variant_image: Optional[str]
    selected_variants: Optional[Dict]
    selected_size: Optional[str]
    selected_color: Optional[str]
    color_code: Optional[str]
    variant: Optional[str]
    sku: Optional[str]
    variant_id: Optional[str]

class ContactDetails(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]

class Address(BaseModel):
    address: Optional[str]
    apartment: Optional[str]
    city: Optional[str]
    state_region: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]

class Order(BaseModel):
    order_id: str
    user: Optional[str]  # Reference to User ID
    guest_id: Optional[str]  # UUID for guest tracking
    order_items: List[OrderItem] = []
    contact_details: ContactDetails
    shipping_address: Address
    billing_address: Address
    payment_method: Optional[str]
    payment_result: Optional[Dict]
    items_price: Optional[float]
    tax_price: Optional[float]
    shipping_price: Optional[float]
    total_price: Optional[float]
    is_paid: bool = False
    paid_at: Optional[datetime]
    is_delivered: bool = False
    delivered_at: Optional[datetime]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)