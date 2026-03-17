from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Page(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    slug: str
    description: Optional[str] = ""
    content: Optional[str] = ""
    meta_title: Optional[str] = ""
    meta_description: Optional[str] = ""
    meta_keywords: Optional[str] = ""
    is_published: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "title": "About Us",
                "slug": "about-us",
                "description": "Learn more about our company.",
                "content": "<p>Welcome to our company!</p>",
                "meta_title": "About Us",
                "meta_description": "Learn more about our company.",
                "meta_keywords": "about, company, info",
                "is_published": True
            }
        }