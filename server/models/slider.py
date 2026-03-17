from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Slider(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    description: str
    button_text: str = "Shop Now"
    button_link: str = "/products"
    bg_image: str
    order: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "title": "Summer Sale",
                "description": "Get the best deals this summer!",
                "button_text": "Shop Now",
                "button_link": "/products",
                "bg_image": "https://example.com/image.jpg",
                "order": 1,
                "is_active": True
            }
        }