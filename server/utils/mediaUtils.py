import os
import uuid
from pathlib import Path

def ensure_uploads_dir():
    uploads_dir = Path(os.getcwd()) / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    return uploads_dir

def validate_file_size(size, max_size=100 * 1024 * 1024):
    return size <= max_size

def generate_filename(original_name):
    ext = Path(original_name).suffix
    unique_name = f"media-{uuid.uuid4().hex}{ext}"
    return unique_name

