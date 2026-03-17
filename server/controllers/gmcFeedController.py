from fastapi import APIRouter, HTTPException
from models.product import Product
from fastapi.responses import Response

router = APIRouter()

def escape_xml(value: str) -> str:
    if not value:
        return ""
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )

@router.get("/gmc-feed.xml")
async def generate_gmc_feed():
    try:
        products = await Product.find({"isDraft": False}).populate("categories").to_list(length=None)

        if not products:
            empty_feed = """
            <?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
                <channel>
                    <title>Wolf Supplies</title>
                    <link>https://wolfsupplies.co.uk</link>
                    <description>Product Feed</description>
                </channel>
            </rss>
            """
            return Response(content=empty_feed, media_type="application/xml")

        # Build product items XML
        items_xml = ""  # Add logic to build items XML here

        return Response(content=f"<rss><channel>{items_xml}</channel></rss>", media_type="application/xml")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error generating GMC feed")
