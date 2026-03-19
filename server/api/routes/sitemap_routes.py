from fastapi import APIRouter
from controllers.sitemap_controller import (
    generate_sitemap
)

router = APIRouter()

@router.get("/sitemap")
async def fetch_sitemap():
    return await generate_sitemap()

@router.get("/sitemap.xml")
async def fetch_sitemap_xml():
    return await generate_sitemap()
