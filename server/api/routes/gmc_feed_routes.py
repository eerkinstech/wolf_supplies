from fastapi import APIRouter
from controllers.gmc_feed_controller import (
    generate_gmc_feed
)

router = APIRouter()

@router.get("/gmc-feed")
async def fetch_gmc_feed():
    return await generate_gmc_feed()

@router.get("/gmc-feed.xml")
async def fetch_gmc_feed_xml():
    return await generate_gmc_feed()
