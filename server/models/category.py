from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Category(BaseModel):
    id: Optional[str]  # MongoDB ObjectId
    name: str
    slug: str
    description: Optional[str]
    parent: Optional[str]  # Reference to parent Category ID
    image: Optional[str]
    color: Optional[str]
    meta_title: str = ""
    meta_description: str = ""
    meta_keywords: str = ""
    subcategories: List[str] = []  # References to subcategory IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)