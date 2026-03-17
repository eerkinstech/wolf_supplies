from controllers.gmc_feed_controller import (
    generate_gmc_feed
)

router = APIRouter()

@router.get("/gmc-feed")
async def fetch_gmc_feed():
    return await generate_gmc_feed()