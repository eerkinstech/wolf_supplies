from fastapi import HTTPException

try:
    from .gmcFeedController import generate_gmc_feed as _generate_gmc_feed
except Exception as e:
    print(f"Failed to import gmcFeedController: {e}")
    _generate_gmc_feed = None


async def generate_gmc_feed(*args, **kwargs):
    if _generate_gmc_feed:
        return await _generate_gmc_feed(*args, **kwargs)
    raise HTTPException(status_code=501, detail="generate_gmc_feed not available")
