from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class Review(BaseModel):
    name: Optional[str]
    email: Optional[str]
    rating: Optional[int]
    comment: Optional[str]
    user: Optional[str]  # Reference to User ID
    is_approved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Variant(BaseModel):
    name: Optional[str]  # e.g., "Size", "Color"
    values: List[str] = []  # e.g., ["Small", "Medium", "Large"]

class VariantCombination(BaseModel):
    variant_values: Dict[str, str] = {}  # e.g., {"Size": "Large", "Color": "Red"}
    sku: Optional[str]
    price: Optional[float]
    stock: int = 0
    image: Optional[str]

class Product(BaseModel):
    id: Optional[str]  # MongoDB ObjectId
    name: str
    slug: str
    description: Optional[str]
    categories: List[str] = []  # References to Category IDs
    price: float = 0.0
    original_price: Optional[float]
    discount: float = 0.0
    stock: int = 0
    images: List[str] = []
    variants: List[Variant] = []
    variant_combinations: List[VariantCombination] = []
    in_stock: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)