from pydantic import BaseModel, Field
from typing import List, Optional

class Node(BaseModel):
    id: str
    kind: str
    widget_type: Optional[str] = None
    props: Optional[dict] = {}
    style: Optional[dict] = {}
    advanced: Optional[dict] = {}
    children: Optional[List['Node']] = []

    class Config:
        schema_extra = {
            "example": {
                "id": "root",
                "kind": "root",
                "widget_type": None,
                "props": {},
                "style": {},
                "advanced": {},
                "children": []
            }
        }

class PageConfig(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    page_name: str
    sections: Optional[List[Node]] = []

    class Config:
        schema_extra = {
            "example": {
                "page_name": "home",
                "sections": [
                    {
                        "id": "root",
                        "kind": "root",
                        "children": []
                    }
                ]
            }
        }