from fastapi import APIRouter, Depends
from controllers.pageConfigController import (
    get_page_config,
    save_page_config,
    get_all_page_configs,
    update_page_section,
    delete_page_section,
    toggle_page_publish
)
from middleware.auth_middleware import protect, admin

router = APIRouter()

# Get page configuration (public)
@router.get("/{page_name}")
async def fetch_page_config(page_name: str):
    return await get_page_config(page_name)

# Get all page configurations (admin only)
@router.get("/", dependencies=[Depends(protect), Depends(admin)])
async def fetch_all_page_configs():
    return await get_all_page_configs()

# Save page configuration (admin only)
@router.post("/{page_name}", dependencies=[Depends(protect), Depends(admin)])
async def add_page_config(page_name: str, data: dict):
    return await save_page_config(page_name, data)

# Update specific section (admin only)
@router.patch("/{page_name}/section/{section_id}", dependencies=[Depends(protect), Depends(admin)])
async def modify_page_section(page_name: str, section_id: str, data: dict):
    return await update_page_section(page_name, section_id, data)

# Delete specific section (admin only)
@router.delete("/{page_name}/section/{section_id}", dependencies=[Depends(protect), Depends(admin)])
async def remove_page_section(page_name: str, section_id: str):
    return await delete_page_section(page_name, section_id)

# Toggle page publish status (admin only)
@router.patch("/{page_name}/publish", dependencies=[Depends(protect), Depends(admin)])
async def toggle_publish_status(page_name: str):
    return await toggle_page_publish(page_name)

