from cloudinary import config, uploader
import os

config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Cloudinary uploader instance
cloudinary_uploader = uploader

