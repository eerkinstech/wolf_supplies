from fastapi import APIRouter, HTTPException
from models.page_config import PageConfig
from typing import List
from pydantic import BaseModel

router = APIRouter()

class Section(BaseModel):
    id: str
    name: str
    children: List['Section'] = []

Section.update_forward_refs()

class PageConfigResponse(BaseModel):
    pageName: str
    sections: List[Section]
    isPublished: bool

@router.get("/page-config/{page_name}", response_model=PageConfigResponse)
async def get_page_config(page_name: str):
    valid_pages = ['home', 'categories', 'products', 'about', 'contact']
    if page_name not in valid_pages:
        raise HTTPException(status_code=400, detail="Invalid page name")

    page_config = await PageConfig.find_one({"pageName": page_name})
    if not page_config:
        page_config = PageConfig(
            pageName=page_name,
            sections=[],
            isPublished=True
        )
        await page_config.save()

    def fix_children(nodes):
        if not isinstance(nodes, list):
            return nodes
        for node in nodes:
            if isinstance(node, dict):
                if isinstance(node.get("children"), str):
                    node["children"] = []
                elif isinstance(node.get("children"), list):
                    node["children"] = fix_children(node["children"])
        return nodes

    page_config.sections = fix_children(page_config.sections)
    return page_config

