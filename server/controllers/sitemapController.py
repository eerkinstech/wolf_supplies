from fastapi import APIRouter, HTTPException
from models.product import Product
from models.page import Page
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

@router.get("/sitemap.xml")
async def generate_sitemap():
    try:
        products = await Product.find({"isDraft": False}).to_list(length=None)
        pages = await Page.find({"published": True}).to_list(length=None)

        url_entries = """
        <url>
            <loc>https://wolfsupplies.co.uk/</loc>
            <lastmod>{}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
        """.format(
            escape_xml("2026-03-10")
        )

        # Add products and pages logic here
        return Response(content=f"<urlset>{url_entries}</urlset>", media_type="application/xml")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error generating sitemap")
