from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Policy(BaseModel):
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
                "title": "Privacy Policy",
                "slug": "privacy-policy",
                "description": "Our privacy policy details.",
                "content": "<p>We value your privacy...</p>",
                "meta_title": "Privacy Policy",
                "meta_description": "Details about our privacy policy.",
                "meta_keywords": "privacy, policy",
                "is_published": True
            }
        }