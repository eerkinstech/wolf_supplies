from controllers.sitemap_controller import (
    generate_sitemap
)

router = APIRouter()

@router.get("/sitemap")
async def fetch_sitemap():
    return await generate_sitemap()