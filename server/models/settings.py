from pydantic import BaseModel, Field
from typing import List, Optional

class Submenu(BaseModel):
    id: Optional[str] = None
    label: Optional[str] = None
    name: Optional[str] = None
    url: Optional[str] = None
    link: Optional[str] = None
    submenu: Optional[List['Submenu']] = []

    class Config:
        schema_extra = {
            "example": {
                "id": "1",
                "label": "Electronics",
                "name": "electronics",
                "url": "/electronics",
                "link": "/electronics",
                "submenu": []
            }
        }

class Settings(BaseModel):
    require_review_approval: bool = True
    default_assistant_model: str = "claude-haiku-4.5"
    browse_menu: Optional[List[Submenu]] = []

    class Config:
        schema_extra = {
            "example": {
                "require_review_approval": True,
                "default_assistant_model": "claude-haiku-4.5",
                "browse_menu": [
                    {
                        "id": "1",
                        "label": "Electronics",
                        "name": "electronics",
                        "url": "/electronics",
                        "link": "/electronics",
                        "submenu": []
                    }
                ]
            }
        }