from fastapi import HTTPException

try:
    from .sitemapController import generate_sitemap as _generate_sitemap
except Exception as e:
    print(f"Failed to import sitemapController: {e}")
    _generate_sitemap = None


async def generate_sitemap(*args, **kwargs):
    if _generate_sitemap:
        return await _generate_sitemap(*args, **kwargs)
    raise HTTPException(status_code=501, detail="generate_sitemap not available")
