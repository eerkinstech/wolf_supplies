from pydantic import BaseModel, Field
from typing import Optional

class MediaAsset(BaseModel):
    id: Optional[str]  # MongoDB ObjectId
    filename: str
    mime: str  # e.g., 'image/jpeg', 'video/mp4'
    size: int
    type: str  # 'image' or 'video'
    storage_key_or_path: str  # e.g., "uploads/media-1704067200000-abc123.jpg"
    url: str