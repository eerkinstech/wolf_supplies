from datetime import datetime
from fastapi import HTTPException
from fastapi.responses import Response
from database import db

SITE_URL = "https://wolfsupplies.co.uk"


def escape_xml(value) -> str:
    text = "" if value is None else str(value)
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _format_lastmod(value) -> str:
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, str) and value.strip():
        return value[:10]
    return datetime.utcnow().date().isoformat()


def _build_url_entry(loc: str, lastmod: str, changefreq: str, priority: str) -> str:
    return """
        <url>
            <loc>{}</loc>
            <lastmod>{}</lastmod>
            <changefreq>{}</changefreq>
            <priority>{}</priority>
        </url>
    """.format(
        escape_xml(loc),
        escape_xml(lastmod),
        escape_xml(changefreq),
        escape_xml(priority),
    )


async def generate_sitemap():
    try:
        products_coll = db.get_collection("products")
        pages_coll = db.get_collection("pages")
        categories_coll = db.get_collection("categories")
        policies_coll = db.get_collection("policies")

        products = list(products_coll.find({"isDraft": {"$ne": True}}))
        pages = list(
            pages_coll.find(
                {
                    "$or": [
                        {"published": True},
                        {"isPublished": True},
                        {"is_published": True},
                    ]
                }
            )
        )
        categories = list(categories_coll.find({}))
        policies = list(policies_coll.find({}))

        entries = []
        seen_urls = set()

        def add_entry(path: str, lastmod_value=None, changefreq: str = "weekly", priority: str = "0.7"):
            clean_path = "/" if path == "/" else f"/{str(path).strip('/')}"
            loc = f"{SITE_URL}{clean_path}"
            if loc in seen_urls:
                return
            seen_urls.add(loc)
            entries.append(
                _build_url_entry(
                    loc,
                    _format_lastmod(lastmod_value),
                    changefreq,
                    priority,
                )
            )

        add_entry("/", datetime.utcnow(), "daily", "1.0")

        for path, changefreq, priority in [
            ("/products", "daily", "0.9"),
            ("/categories", "weekly", "0.8"),
            ("/about", "monthly", "0.7"),
            ("/contact", "monthly", "0.7"),
            ("/payment-options", "monthly", "0.6"),
            ("/order-lookup", "monthly", "0.4"),
            ("/sitemap", "monthly", "0.3"),
            ("/policies/shipping", "monthly", "0.5"),
            ("/policies/returns", "monthly", "0.5"),
            ("/policies/privacy", "monthly", "0.5"),
            ("/policies/terms", "monthly", "0.5"),
            ("/policies/faq", "monthly", "0.5"),
        ]:
            add_entry(path, datetime.utcnow(), changefreq, priority)

        policy_slug_map = {
            "shipping": "/policies/shipping",
            "returns": "/policies/returns",
            "privacy": "/policies/privacy",
            "terms": "/policies/terms",
            "faq": "/policies/faq",
        }

        for page in pages:
            slug = (page.get("slug") or "").strip("/")
            if not slug:
                continue
            add_entry(
                f"/{slug}",
                page.get("updatedAt") or page.get("updated_at") or page.get("createdAt"),
                "weekly",
                "0.7",
            )

        for policy in policies:
            slug = (policy.get("slug") or "").strip("/")
            if not slug:
                continue
            add_entry(
                policy_slug_map.get(slug, f"/policies/{slug}"),
                policy.get("updatedAt") or policy.get("updated_at") or policy.get("createdAt"),
                "monthly",
                "0.5",
            )

        for category in categories:
            slug = (category.get("slug") or "").strip("/")
            if not slug:
                continue
            add_entry(
                f"/category/{slug}",
                category.get("updatedAt") or category.get("updated_at") or category.get("createdAt"),
                "weekly",
                "0.8",
            )

        for product in products:
            slug = (product.get("slug") or "").strip("/")
            if not slug:
                continue
            add_entry(
                f"/product/{slug}",
                product.get("updatedAt") or product.get("updated_at") or product.get("createdAt"),
                "weekly",
                "0.8",
            )

        xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{}
</urlset>""".format("".join(entries))

        return Response(content=xml, media_type="application/xml")
    except HTTPException:
        raise
    except Exception as e:
        print(f"sitemapController.generate_sitemap error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Error generating sitemap")
