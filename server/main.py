import html
import json
import os
import re
import sys
from urllib.parse import urlsplit
# Ensure project root is on sys.path so imports like 'server.models' work
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
from fastapi import FastAPI, Request, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware

# Import middleware
from middleware.caching_headers_middleware import CachingHeadersMiddleware
from dotenv import load_dotenv

# Import database from our database module
from database import client, db

import uvicorn

# Import routers
try:
    from api.routes.product_routes import router as product_router
except Exception as e:
    product_router = None
    print("Warning: product routes not loaded:", e)

# Load environment variables
load_dotenv()

app = FastAPI()

HTML_TEMPLATE_CACHE = {}
BOT_USER_AGENT_MARKERS = (
    "googlebot",
    "google-inspectiontool",
    "bingbot",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "facebot",
    "twitterbot",
    "linkedinbot",
)
SEO_ROUTES_NOINDEX = {
    "/cart",
    "/checkout",
    "/wishlist",
    "/order-lookup",
    "/sitemap",
}
STATIC_SEO_ROUTES = {
    "/": {
        "title": "Wolf Supplies | Premium Quality Products, Fast UK Delivery & 31-Day Returns",
        "description": "Shop premium products at Wolf Supplies. Fast UK delivery, dependable quality, and straightforward returns.",
        "keywords": "wolf supplies, premium products, UK delivery, ecommerce",
        "type": "website",
        "heading": "Wolf Supplies",
        "body": "Shop premium products with fast UK delivery and dependable customer support.",
    },
    "/products": {
        "title": "All Products | Wolf Supplies",
        "description": "Browse the full Wolf Supplies catalogue with fast UK delivery and practical products for home, garden, and trade use.",
        "keywords": "all products, wolf supplies, shop, UK delivery",
        "type": "website",
        "heading": "All Products",
        "body": "Browse the latest Wolf Supplies products and collections.",
    },
    "/categories": {
        "title": "Product Categories | Wolf Supplies",
        "description": "Explore Wolf Supplies product categories and find the right products faster.",
        "keywords": "product categories, wolf supplies, shop categories",
        "type": "website",
        "heading": "Product Categories",
        "body": "Explore product categories across the Wolf Supplies catalogue.",
    },
    "/about": {
        "title": "About Wolf Supplies",
        "description": "Learn more about Wolf Supplies, our product standards, and our customer-first approach.",
        "keywords": "about wolf supplies, company information",
        "type": "website",
        "heading": "About Wolf Supplies",
        "body": "Learn more about Wolf Supplies and our approach to practical, high-quality products.",
    },
    "/contact": {
        "title": "Contact Wolf Supplies",
        "description": "Contact Wolf Supplies for product questions, order support, and general enquiries.",
        "keywords": "contact wolf supplies, customer support",
        "type": "website",
        "heading": "Contact Wolf Supplies",
        "body": "Get in touch with Wolf Supplies for support, sales, and order enquiries.",
    },
    "/payment-options": {
        "title": "Payment Options | Wolf Supplies",
        "description": "Review the payment options available at Wolf Supplies before placing your order.",
        "keywords": "payment options, wolf supplies",
        "type": "website",
        "heading": "Payment Options",
        "body": "Learn about the payment methods accepted by Wolf Supplies.",
    },
    "/order-lookup": {
        "title": "Order Lookup | Wolf Supplies",
        "description": "Check your order status and details with Wolf Supplies order lookup.",
        "keywords": "order lookup, order tracking, wolf supplies",
        "type": "website",
        "heading": "Order Lookup",
        "body": "Look up an existing order using your order details.",
        "robots": "noindex, nofollow",
    },
    "/cart": {
        "title": "Your Cart | Wolf Supplies",
        "description": "Review the items in your Wolf Supplies cart before checkout.",
        "keywords": "shopping cart, wolf supplies",
        "type": "website",
        "heading": "Shopping Cart",
        "body": "Review your selected items before proceeding to checkout.",
        "robots": "noindex, nofollow",
    },
    "/checkout": {
        "title": "Checkout | Wolf Supplies",
        "description": "Complete your Wolf Supplies purchase securely.",
        "keywords": "checkout, secure checkout, wolf supplies",
        "type": "website",
        "heading": "Checkout",
        "body": "Complete your purchase securely with Wolf Supplies.",
        "robots": "noindex, nofollow",
    },
    "/wishlist": {
        "title": "Wishlist | Wolf Supplies",
        "description": "View your saved Wolf Supplies items.",
        "keywords": "wishlist, saved items, wolf supplies",
        "type": "website",
        "heading": "Wishlist",
        "body": "Review the items you have saved for later.",
        "robots": "noindex, nofollow",
    },
}


def build_sitewide_structured_data(base_url: str) -> list[dict]:
    contact_email = (os.getenv("SUPPORT_EMAIL") or os.getenv("ADMIN_EMAIL") or "sales@wolfsupplies.co.uk").strip()
    contact_phone = (os.getenv("SUPPORT_PHONE") or "+447398998101").strip()
    return [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": f"{base_url}/#organization",
            "name": "Wolf Supplies",
            "url": base_url,
            "email": contact_email,
            "telephone": contact_phone,
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": contact_email,
                "telephone": contact_phone,
                "availableLanguage": ["en-GB"],
                "areaServed": "GB",
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": f"{base_url}/#website",
            "name": "Wolf Supplies",
            "url": base_url,
            "publisher": {"@id": f"{base_url}/#organization"},
        },
    ]


def get_base_site_url(request: Request) -> str:
    site_url = (
        os.getenv("CLIENT_URL")
        or os.getenv("SITE_URL")
        or os.getenv("PUBLIC_SITE_URL")
        or ""
    ).strip()
    if site_url:
        return site_url.rstrip("/")

    host = (request.url.hostname or "").strip().lower()
    if host in {"127.0.0.1", "localhost", "0.0.0.0"}:
        return "https://wolfsupplies.co.uk"

    return str(request.base_url).rstrip("/")


def load_html_template(template_path: str) -> str:
    cached = HTML_TEMPLATE_CACHE.get(template_path)
    if cached is None:
        with open(template_path, "r", encoding="utf-8") as f:
            cached = f.read()
        HTML_TEMPLATE_CACHE[template_path] = cached
    return cached


def strip_html_tags(value: str) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value)).strip()


def truncate_text(value: str, limit: int = 200) -> str:
    if len(value) <= limit:
        return value
    return value[: limit - 3].rstrip() + "..."


def first_non_empty(*values):
    for value in values:
        if isinstance(value, str) and value.strip():
            return value.strip()
        if value not in (None, "", [], {}):
            return value
    return ""


def make_absolute_url(base_url: str, value: str) -> str:
    if not value:
        return ""
    if value.startswith("http://") or value.startswith("https://"):
        return value
    return f"{base_url}/{value.lstrip('/')}"


def extract_media_url(value) -> str:
    if not value:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        for key in ("url", "secure_url", "secureUrl", "public_url", "publicUrl", "serverUrl", "path", "src", "image"):
            candidate = value.get(key)
            if isinstance(candidate, str) and candidate.strip():
                return candidate.strip()
    return ""


def extract_product_images(product: dict, base_url: str) -> list[str]:
    images = []
    primary_image = extract_media_url(product.get("image"))
    if primary_image:
        images.append(make_absolute_url(base_url, primary_image))

    for raw_image in product.get("images") or []:
        normalized = extract_media_url(raw_image)
        if normalized:
            images.append(make_absolute_url(base_url, normalized))

    deduped = []
    seen = set()
    for image in images:
        if image and image not in seen:
            seen.add(image)
            deduped.append(image)
    return deduped


def get_product_offer_summary(product: dict) -> tuple[float | None, int, str]:
    prices = []
    stock_values = []
    sku = first_non_empty(product.get("sku"), "")

    base_price = product.get("price")
    if isinstance(base_price, (int, float)) and base_price > 0:
        prices.append(float(base_price))

    base_stock = product.get("stock")
    if isinstance(base_stock, (int, float)):
        stock_values.append(int(base_stock))

    for variant in product.get("variantCombinations") or []:
        variant_price = variant.get("price")
        if isinstance(variant_price, (int, float)) and variant_price > 0:
            prices.append(float(variant_price))
        variant_stock = variant.get("stock")
        if isinstance(variant_stock, (int, float)):
            stock_values.append(int(variant_stock))
        if not sku:
            sku = first_non_empty(variant.get("sku"), sku)

    price = min(prices) if prices else None
    stock = max(stock_values) if stock_values else 0
    return price, stock, sku


def build_product_offers_schema(product: dict, base_url: str, path: str):
    shipping_details = {
        "@type": "OfferShippingDetails",
        "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0.00",
            "currency": "GBP",
        },
        "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "GB",
        },
        "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 2,
                "unitCode": "DAY",
            },
            "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 2,
                "maxValue": 4,
                "unitCode": "DAY",
            },
        },
    }
    return_policy = {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "GB",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 31,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn",
    }

    variant_offers = []
    for index, variant in enumerate(product.get("variantCombinations") or [], start=1):
        variant_price = variant.get("price")
        if not isinstance(variant_price, (int, float)) or variant_price <= 0:
            continue

        variant_id = first_non_empty(variant.get("_id"), variant.get("id"), index)
        variant_stock = variant.get("stock") if isinstance(variant.get("stock"), (int, float)) else 0
        offer = {
            "@type": "Offer",
            "priceCurrency": "GBP",
            "price": f"{float(variant_price):.2f}",
            "availability": "https://schema.org/InStock" if variant_stock > 0 else "https://schema.org/OutOfStock",
            "url": f"{base_url}{path}?variant={variant_id}",
            "itemCondition": "https://schema.org/NewCondition",
            "shippingDetails": shipping_details,
            "hasMerchantReturnPolicy": return_policy,
        }
        variant_offers.append(offer)

    if variant_offers:
        return variant_offers

    price, stock, _ = get_product_offer_summary(product)
    offer = {
        "@type": "Offer",
        "priceCurrency": "GBP",
        "availability": "https://schema.org/InStock" if stock and stock > 0 else "https://schema.org/OutOfStock",
        "url": f"{base_url}{path}",
        "itemCondition": "https://schema.org/NewCondition",
        "shippingDetails": shipping_details,
        "hasMerchantReturnPolicy": return_policy,
    }
    if price is not None:
        offer["price"] = f"{price:.2f}"
    return offer


def build_product_reviews_schema(product: dict) -> tuple[dict | None, list[dict]]:
    reviews = product.get("reviews") or []
    approved_reviews = [
        review for review in reviews
        if isinstance(review, dict) and review.get("isApproved", True) is not False
    ]

    review_schema = []
    for review in approved_reviews[:10]:
        author_name = first_non_empty(review.get("name"), "Verified customer")
        review_body = truncate_text(strip_html_tags(first_non_empty(review.get("comment"), "")), 300)
        rating_value = review.get("rating")
        if not review_body or not isinstance(rating_value, (int, float)):
            continue
        review_schema.append({
            "@type": "Review",
            "author": {
                "@type": "Person",
                "name": author_name,
            },
            "reviewBody": review_body,
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": float(rating_value),
                "bestRating": 5,
                "worstRating": 1,
            },
        })

    rating_value = product.get("rating")
    review_count = product.get("numReviews") or len(review_schema)
    aggregate_rating = None
    if isinstance(rating_value, (int, float)) and rating_value > 0 and review_count > 0:
        aggregate_rating = {
            "@type": "AggregateRating",
            "ratingValue": float(rating_value),
            "reviewCount": int(review_count),
            "bestRating": 5,
            "worstRating": 1,
        }

    return aggregate_rating, review_schema


def build_products_listing_seo(base_url: str, path: str) -> dict:
    total_products = 0
    list_items = []
    list_markup = []

    try:
        coll = db.get_collection("products")
        products = list(
            coll.find({"isDraft": {"$ne": True}}, {"name": 1, "slug": 1, "description": 1, "images": 1, "image": 1})
            .sort("_id", -1)
            .limit(24)
        )

        for index, product in enumerate(products, start=1):
            slug = (product.get("slug") or "").strip()
            name = first_non_empty(product.get("name"), "Product")
            if not slug:
                continue
            url = f"{base_url}/product/{slug}"
            list_items.append({
                "@type": "ListItem",
                "position": index,
                "url": url,
                "name": name,
            })
            list_markup.append(
                f'<li><a href="{html.escape(url)}">{html.escape(name)}</a></li>'
            )

        total_products = coll.count_documents({"isDraft": {"$ne": True}})
    except Exception:
        pass

    body = (
        f"Browse {total_products} published products from Wolf Supplies."
        if total_products
        else "Browse the full Wolf Supplies catalogue."
    )
    extra_html = ""
    if list_markup:
        extra_html = (
            "<section>"
            "<h2>Featured Products</h2>"
            "<ul>"
            f"{''.join(list_markup)}"
            "</ul>"
            "</section>"
        )

    return {
        "title": "All Products | Wolf Supplies",
        "description": "Browse the full Wolf Supplies catalogue with fast UK delivery and practical products for home, garden, and trade use.",
        "keywords": "all products, wolf supplies, shop, UK delivery",
        "canonical": f"{base_url}{path}",
        "type": "website",
        "heading": "All Products",
        "body": body,
        "extra_html": extra_html,
        "structured_data": {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "All Products | Wolf Supplies",
            "description": body,
            "url": f"{base_url}{path}",
            "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": total_products,
                "itemListElement": list_items,
            },
        },
    }


def build_categories_listing_seo(base_url: str, path: str) -> dict:
    total_categories = 0
    list_items = []
    list_markup = []

    try:
        coll = db.get_collection("categories")
        categories = list(
            coll.find({}, {"name": 1, "slug": 1, "description": 1})
            .sort("name", 1)
            .limit(50)
        )

        for index, category in enumerate(categories, start=1):
            slug = (category.get("slug") or "").strip()
            name = first_non_empty(category.get("name"), "Category")
            if not slug:
                continue
            url = f"{base_url}/category/{slug}"
            list_items.append({
                "@type": "ListItem",
                "position": index,
                "url": url,
                "name": name,
            })
            list_markup.append(
                f'<li><a href="{html.escape(url)}">{html.escape(name)}</a></li>'
            )

        total_categories = coll.count_documents({})
    except Exception:
        pass

    body = (
        f"Explore {total_categories} product categories from Wolf Supplies."
        if total_categories
        else "Explore Wolf Supplies product categories and collections."
    )
    extra_html = ""
    if list_markup:
        extra_html = (
            "<section>"
            "<h2>Browse Categories</h2>"
            "<ul>"
            f"{''.join(list_markup)}"
            "</ul>"
            "</section>"
        )

    return {
        "title": "Product Categories | Wolf Supplies",
        "description": "Explore Wolf Supplies product categories and find the right products faster.",
        "keywords": "product categories, wolf supplies, shop categories",
        "canonical": f"{base_url}{path}",
        "type": "website",
        "heading": "Product Categories",
        "body": body,
        "extra_html": extra_html,
        "structured_data": {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Product Categories | Wolf Supplies",
            "description": body,
            "url": f"{base_url}{path}",
            "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": total_categories,
                "itemListElement": list_items,
            },
        },
    }


def serialize_for_json(value):
    if value.__class__.__name__ == "ObjectId":
        return str(value)
    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except Exception:
            return str(value)
    if isinstance(value, dict):
        return {k: serialize_for_json(v) for k, v in value.items()}
    if isinstance(value, list):
        return [serialize_for_json(v) for v in value]
    return value


def build_seo_head(metadata: dict) -> str:
    title = html.escape(metadata["title"])
    description = html.escape(metadata["description"])
    canonical = html.escape(metadata["canonical"])
    parsed_canonical = urlsplit(metadata["canonical"])
    base_url = f"{parsed_canonical.scheme}://{parsed_canonical.netloc}" if parsed_canonical.scheme and parsed_canonical.netloc else "https://wolfsupplies.co.uk"
    keywords = html.escape(metadata.get("keywords", ""))
    og_image = html.escape(metadata.get("image", ""))
    robots = html.escape(metadata.get("robots", "index, follow"))
    site_name = html.escape(metadata.get("site_name", "Wolf Supplies"))
    page_type = html.escape(metadata.get("type", "website"))
    head_parts = [
        f"<title>{title}</title>",
        f'<meta name="description" content="{description}">',
        f'<meta name="robots" content="{robots}">',
        f'<link rel="canonical" href="{canonical}">',
        f'<meta property="og:title" content="{title}">',
        f'<meta property="og:description" content="{description}">',
        f'<meta property="og:url" content="{canonical}">',
        f'<meta property="og:type" content="{page_type}">',
        f'<meta property="og:site_name" content="{site_name}">',
        f'<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{title}">',
        f'<meta name="twitter:description" content="{description}">',
    ]
    if keywords:
        head_parts.append(f'<meta name="keywords" content="{keywords}">')
    if og_image:
        head_parts.append(f'<meta property="og:image" content="{og_image}">')
        head_parts.append(f'<meta name="twitter:image" content="{og_image}">')
    if metadata.get("structured_data"):
        structured_json = json.dumps(serialize_for_json(metadata["structured_data"]), ensure_ascii=False)
        head_parts.append(f'<script type="application/ld+json">{structured_json}</script>')
    for global_schema in build_sitewide_structured_data(base_url):
        schema_json = json.dumps(serialize_for_json(global_schema), ensure_ascii=False)
        head_parts.append(f'<script type="application/ld+json">{schema_json}</script>')
    if metadata.get("preloaded_state"):
        preloaded_json = json.dumps(serialize_for_json(metadata["preloaded_state"]), ensure_ascii=False)
        head_parts.append(f'<script>window.__SEO_PRELOADED_STATE__={preloaded_json};window.__SEO_PRELOADED_PRODUCT__=(window.__SEO_PRELOADED_STATE__||{{}}).product||null;</script>')
    return "\n  ".join(head_parts)


def is_bot_request(request: Request) -> bool:
    user_agent = (request.headers.get("user-agent") or "").lower()
    return any(marker in user_agent for marker in BOT_USER_AGENT_MARKERS)


def build_seo_snapshot(metadata: dict, bot_mode: bool = False) -> str:
    heading = html.escape(metadata.get("heading") or metadata["title"])
    body = html.escape(metadata.get("body") or metadata["description"])
    extra = metadata.get("extra_html", "")
    image = html.escape(metadata.get("image") or "")
    if bot_mode:
        card_styles = (
            "display:block;max-width:920px;margin:24px auto;padding:28px;"
            "font-family:Arial,sans-serif;color:#1f2937;background:#f8fafc;"
            "border:1px solid #dbe4ee;border-radius:20px;box-sizing:border-box;"
        )
        media_html = (
            f'<div style="flex:0 0 280px;max-width:280px;">'
            f'<img src="{image}" alt="{heading}" '
            'style="display:block;width:100%;height:auto;border-radius:16px;'
            'border:1px solid #dbe4ee;background:#ffffff;object-fit:cover;">'
            '</div>'
        ) if image else ""
        content_max_width = "580px" if image else "100%"
        return (
            '<div id="seo-route-preview" data-seo-rendered="true" '
            f'style="{card_styles}">'
            '<main>'
            '<div style="display:flex;gap:24px;align-items:flex-start;">'
            f'{media_html}'
            f'<div style="flex:1;max-width:{content_max_width};">'
            f'<h1 style="margin:0 0 16px;font-size:38px;line-height:1.15;font-weight:700;color:#0f172a;">{heading}</h1>'
            f'<p style="margin:0 0 18px;font-size:24px;line-height:1.45;color:#334155;">{body}</p>'
            f'<div style="font-size:22px;line-height:1.6;color:#0f172a;">{extra}</div>'
            '</div>'
            '</div>'
            '</main></div>'
        )

    styles = (
        "position:absolute;left:-99999px;top:auto;width:1px;height:1px;overflow:hidden;"
    )
    return (
        '<div id="seo-route-preview" data-seo-rendered="true" '
        f'style="{styles}">'
        f"<main><h1>{heading}</h1><p>{body}</p>{extra}</main></div>"
    )


def get_collection_doc(collection_name: str, query: dict):
    coll = db.get_collection(collection_name)
    return coll.find_one(query)


def build_product_seo(slug: str, base_url: str, path: str) -> dict | None:
    product = get_collection_doc("products", {"slug": slug})
    if not product:
        return None

    name = first_non_empty(product.get("metaTitle"), product.get("name"), "Product")
    description = first_non_empty(
        product.get("metaDescription"),
        strip_html_tags(product.get("description", "")),
        f"Buy {product.get('name', 'this product')} online from Wolf Supplies.",
    )
    product_images = extract_product_images(product, base_url)
    image = product_images[0] if product_images else ""
    price, stock, sku = get_product_offer_summary(product)
    aggregate_rating, review_schema = build_product_reviews_schema(product)
    extra_html = ""
    if price is not None:
        extra_html += f"<p>Price: {html.escape(f'{price:.2f}')}</p>"
    extra_html += f"<p>Availability: {'In stock' if stock and stock > 0 else 'Out of stock'}</p>"

    structured_data = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": first_non_empty(product.get("name"), name),
        "description": truncate_text(strip_html_tags(product.get("description", "")) or description, 500),
        "url": f"{base_url}{path}",
        "image": product_images,
        "brand": {"@type": "Brand", "name": "Wolf Supplies"},
        "offers": build_product_offers_schema(product, base_url, path),
    }
    if sku:
        structured_data["sku"] = sku
        structured_data["mpn"] = sku
    if aggregate_rating:
        structured_data["aggregateRating"] = aggregate_rating
    if review_schema:
        structured_data["review"] = review_schema

    return {
        "title": f"{name} | Wolf Supplies",
        "description": truncate_text(description, 160),
        "keywords": first_non_empty(product.get("metaKeywords"), ""),
        "canonical": f"{base_url}{path}",
        "image": image,
        "type": "product",
        "heading": first_non_empty(product.get("name"), name),
        "body": truncate_text(strip_html_tags(product.get("description", "")) or description, 220),
        "extra_html": extra_html,
        "structured_data": structured_data,
        "preloaded_state": {
            "product": product,
        },
        "prefer_client_render_for_bots": True,
    }


def build_category_seo(slug: str, base_url: str, path: str) -> dict | None:
    category = get_collection_doc("categories", {"slug": slug})
    if not category:
        return None

    name = first_non_empty(category.get("metaTitle"), category.get("name"), "Category")
    description = first_non_empty(
        category.get("metaDescription"),
        strip_html_tags(category.get("description", "")),
        f"Shop {category.get('name', 'this category')} products at Wolf Supplies.",
    )
    return {
        "title": f"{name} | Wolf Supplies",
        "description": truncate_text(description, 160),
        "keywords": first_non_empty(category.get("metaKeywords"), ""),
        "canonical": f"{base_url}{path}",
        "image": make_absolute_url(base_url, extract_media_url(category.get("image"))),
        "type": "website",
        "heading": first_non_empty(category.get("name"), name),
        "body": truncate_text(strip_html_tags(category.get("description", "")) or description, 220),
        "structured_data": {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": first_non_empty(category.get("name"), name),
            "description": truncate_text(strip_html_tags(category.get("description", "")) or description, 500),
            "url": f"{base_url}{path}",
        },
    }


def build_content_page_seo(collection_name: str, slug: str, base_url: str, path: str) -> dict | None:
    page = get_collection_doc(collection_name, {"slug": slug, "isPublished": {"$ne": False}})
    if not page:
        return None

    title = first_non_empty(page.get("metaTitle"), page.get("title"), "Wolf Supplies")
    description = first_non_empty(
        page.get("metaDescription"),
        strip_html_tags(page.get("description", "")),
        strip_html_tags(page.get("content", "")),
        f"Read more on Wolf Supplies: {page.get('title', 'Page')}.",
    )
    return {
        "title": f"{title} | Wolf Supplies" if "wolf supplies" not in title.lower() else title,
        "description": truncate_text(description, 160),
        "keywords": first_non_empty(page.get("metaKeywords"), ""),
        "canonical": f"{base_url}{path}",
        "type": "article" if collection_name == "policies" else "website",
        "heading": first_non_empty(page.get("title"), title),
        "body": truncate_text(strip_html_tags(page.get("content", "")) or description, 260),
        "structured_data": {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": first_non_empty(page.get("title"), title),
            "description": truncate_text(description, 500),
            "url": f"{base_url}{path}",
        },
    }


def build_route_seo(path: str, request: Request) -> dict:
    base_url = get_base_site_url(request)

    if path.startswith("/admin"):
        return {
            "title": "Admin | Wolf Supplies",
            "description": "Wolf Supplies admin area.",
            "keywords": "",
            "canonical": f"{base_url}{path}",
            "type": "website",
            "heading": "Admin",
            "body": "Wolf Supplies administration area.",
            "robots": "noindex, nofollow",
        }

    if path.startswith("/product/"):
        slug = path.split("/product/", 1)[1].strip("/")
        seo = build_product_seo(slug, base_url, path)
        if seo:
            return seo

    if path.startswith("/category/"):
        slug = path.split("/category/", 1)[1].strip("/")
        seo = build_category_seo(slug, base_url, path)
        if seo:
            return seo

    if path.startswith("/policies/"):
        slug = path.split("/policies/", 1)[1].strip("/")
        seo = build_content_page_seo("policies", slug, base_url, path)
        if seo:
            return seo

    if path.startswith("/order/"):
        return {
            "title": "Order Details | Wolf Supplies",
            "description": "Order details page.",
            "keywords": "",
            "canonical": f"{base_url}{path}",
            "type": "website",
            "heading": "Order Details",
            "body": "Order details for an existing purchase.",
            "robots": "noindex, nofollow",
        }

    if path == "/products":
        return build_products_listing_seo(base_url, path)

    if path == "/categories":
        return build_categories_listing_seo(base_url, path)

    if path in STATIC_SEO_ROUTES:
        static_meta = STATIC_SEO_ROUTES[path].copy()
        static_meta["canonical"] = f"{base_url}{path}" if path != "/" else base_url
        static_meta.setdefault("robots", "index, follow")
        static_meta.setdefault("site_name", "Wolf Supplies")
        return static_meta

    slug = path.strip("/")
    if slug:
        seo = build_content_page_seo("pages", slug, base_url, path)
        if seo:
            return seo

    return {
        "title": "Wolf Supplies | Premium Quality Products, Fast UK Delivery & 31-Day Returns",
        "description": "Shop premium products at Wolf Supplies with fast UK delivery.",
        "keywords": "wolf supplies, premium products, UK delivery",
        "canonical": f"{base_url}{path}" if path != "/" else base_url,
        "type": "website",
        "heading": "Wolf Supplies",
        "body": "Wolf Supplies online store.",
        "robots": "noindex, nofollow" if path in SEO_ROUTES_NOINDEX else "index, follow",
    }


def render_index_html(index_html: str, metadata: dict, bot_mode: bool = False) -> str:
    rendered = re.sub(r"<title>.*?</title>", "", index_html, count=1, flags=re.S)
    rendered = re.sub(r'\s*<meta name="description"[^>]*>\s*', "", rendered, count=1, flags=re.I)
    rendered = re.sub(r'\s*<meta name="keywords"[^>]*>\s*', "", rendered, count=1, flags=re.I)
    rendered = rendered.replace("<head>", f"<head>\n  {build_seo_head(metadata)}", 1)
    snapshot_html = build_seo_snapshot(metadata, bot_mode=False)
    root_html = '<div id="root"></div>'
    return rendered.replace('<div id="root"></div>', f'{snapshot_html}\n  {root_html}', 1)

# Initialize default roles on startup
async def init_default_roles():
    """Initialize default Employee role if it doesn't exist"""
    try:
        from controllers.roles_controller import ensure_default_employee_role
        await ensure_default_employee_role()
    except Exception as e:
        print(f"Warning: Could not initialize default roles: {e}")

@app.on_event("startup")
async def startup_event():
    """Run initialization tasks on server startup"""
    await init_default_roles()

print("Initializing CORS middleware...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend dev server
        "http://localhost:3000",  # Alternative frontend
        "http://127.0.0.1:5173",  # Alternative localhost
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://localhost:5000",  # Backend server (for testing with tools like Postman)
        "http://localhost:8000",
        "https://wolfsupplies.co.uk",  # Production site
    ],
    allow_credentials=True,  # REQUIRED for Authorization header (login, tokens)
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"],
    expose_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"],
    max_age=3600,
)
print("[OK] CORS middleware initialized - allowing localhost:5173 with credentials")

# Add GZip compression middleware only when explicitly enabled.
# Production already sits behind Cloudflare, so app-level gzip is optional.
enable_gzip = (os.getenv("ENABLE_GZIP") or "").strip().lower() in {"1", "true", "yes", "on"}
if enable_gzip:
    print("Initializing GZip compression middleware...")
    app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=6)
    print("[OK] GZip compression middleware initialized")
else:
    print("[SKIP] GZip compression middleware disabled (set ENABLE_GZIP=true to enable)")

# Add caching headers middleware
print("Initializing caching headers middleware...")
app.add_middleware(CachingHeadersMiddleware)
print("[OK] Caching headers middleware initialized")

# =============================================================================
# EXCEPTION HANDLERS (MUST be before routes!)
# =============================================================================
def get_cors_headers(request: Request):
    """Get CORS headers based on origin"""
    origin = request.headers.get("origin")
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://localhost:8000",
        "https://wolfsupplies.co.uk",
    ]
    
    if origin in allowed_origins:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return {}

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTPException and return JSON with CORS headers"""
    print(f"[HTTPException] Status: {exc.status_code}, Detail: {exc.detail}")
    cors_headers = get_cors_headers(request)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status": exc.status_code,
            "path": str(request.url.path),
        },
        headers={
            **cors_headers,
            "Content-Type": "application/json",
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions and return JSON with CORS headers"""
    print(f"[Exception] {type(exc).__name__}: {str(exc)}")
    cors_headers = get_cors_headers(request)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "message": str(exc),
            "path": str(request.url.path),
        },
        headers={
            **cors_headers,
            "Content-Type": "application/json",
        }
    )

# =============================================================================
# ROOT ENDPOINT
# =============================================================================
@app.get("/api")
async def api_root():
    return {
        "status": "ok",
        "message": "E-Commerce API running",
    }

@app.get("/debug/routes")
async def debug_routes():
    """Debug endpoint to list all registered routes"""
    routes_list = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            routes_list.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": getattr(route, 'name', 'unknown')
            })
    return {"routes": sorted(routes_list, key=lambda x: x['path'])}

# =============================================================================
# INCLUDE API ROUTES
# =============================================================================
if product_router:
    app.include_router(product_router, prefix="/api/products")

# Include route modules (api/routes/*) so their endpoints are registered
try:
    from api.routes.auth_routes import router as auth_router
    app.include_router(auth_router, prefix="/api/users")
except Exception as e:
    print("Warning: auth routes not loaded:", e)

try:
    from api.routes.category_routes import router as api_category_router
    app.include_router(api_category_router, prefix="/api/categories")
except Exception as e:
    print("Warning: category api routes not loaded:", e)

try:
    from api.routes.slider_routes import router as api_slider_router
    app.include_router(api_slider_router, prefix="/api/sliders")
except Exception as e:
    print("Warning: slider api routes not loaded:", e)

try:
    from api.routes.settings_routes import router as api_settings_router
    app.include_router(api_settings_router, prefix="/api/settings")
except Exception as e:
    print("Warning: settings api routes not loaded:", e)

try:
    from api.routes.page_routes import router as api_page_router
    app.include_router(api_page_router, prefix="/api/pages")
except Exception as e:
    print("Warning: page api routes not loaded:", e)

# Ensure order routes are registered before any catch-all/static handlers


try:
    from api.routes.media_routes import router as api_media_router
    app.include_router(api_media_router, prefix="/api/media")
except Exception as e:
    print("Warning: media api routes not loaded:", e)

try:
    from api.routes.newsletter_routes import router as api_newsletter_router
    print("[MAIN] Including newsletter router with prefix /api/newsletter")
    app.include_router(api_newsletter_router, prefix="/api/newsletter")
    print("[MAIN] Newsletter router included successfully")
except Exception as e:
    print("Warning: newsletter api routes not loaded:", e)

try:
    from api.routes.upload_routes import router as api_upload_router
    print("[STARTUP] OK Upload routes imported successfully")
    print(f"[STARTUP] Upload router type: {type(api_upload_router)}")
    print(f"[STARTUP] Upload router routes: {[str(route) for route in api_upload_router.routes]}")
    app.include_router(api_upload_router, prefix="/api/upload")
    print("[STARTUP] OK Upload routes registered at /api/upload")
except Exception as e:
    print(f"[STARTUP] FAIL FAILED to load upload routes: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

try:
    from api.routes.order_routes import router as api_order_router
    app.include_router(api_order_router, prefix="/api/orders")
    print("[STARTUP] OK Order routes registered at /api/orders")
except Exception as e:
    print(f"[STARTUP] FAIL Order api routes not loaded: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

try:
    from api.routes.cart_routes import router as api_cart_router
    app.include_router(api_cart_router, prefix="/api/cart")
except Exception as e:
    print("Warning: cart api routes not loaded:", e)

try:
    from api.routes.wishlist_routes import router as api_wishlist_router
    app.include_router(api_wishlist_router, prefix="/api/wishlist")
except Exception as e:
    print("Warning: wishlist api routes not loaded:", e)

try:
    from api.routes.payment_routes import router as api_payment_router
    app.include_router(api_payment_router, prefix="/api/payments")
except Exception as e:
    print("Warning: payment api routes not loaded:", e)

try:
    from api.routes.pageConfigRoutes import router as api_pageconfig_router
    app.include_router(api_pageconfig_router, prefix="/api/page-config")
except Exception as e:
    print("Warning: page-config api routes not loaded:", e)

try:
    from api.routes.policy_routes import router as api_policy_router
    app.include_router(api_policy_router, prefix="/api/policies")
except Exception as e:
    print("Warning: policy api routes not loaded:", e)

try:
    from api.routes.coupon_routes import router as api_coupon_router
    app.include_router(api_coupon_router, prefix="/api/coupons")
except Exception as e:
    print("Warning: coupon api routes not loaded:", e)

try:
    from api.routes.roles_routes import router as api_roles_router
    app.include_router(api_roles_router, prefix="/api/roles")
except Exception as e:
    print("Warning: roles api routes not loaded:", e)

try:
    from api.routes.employees_routes import router as api_employees_router
    app.include_router(api_employees_router, prefix="/api/employees")
except Exception as e:
    print("Warning: employees api routes not loaded:", e)

try:
    from api.routes.sitemap_routes import router as api_sitemap_router
    app.include_router(api_sitemap_router, prefix="/api")
except Exception as e:
    print("Warning: sitemap api routes not loaded:", e)

try:
    from api.routes.gmc_feed_routes import router as api_gmc_router
    app.include_router(api_gmc_router, prefix="/api")
except Exception as e:
    print("Warning: gmc feed api routes not loaded:", e)

try:
    from api.routes.redirect_routes import router as api_redirect_router
    app.include_router(api_redirect_router, prefix="/api")
except Exception as e:
    print("Warning: redirect api routes not loaded:", e)

try:
    from api.routes.form_routes import router as api_form_router
    app.include_router(api_form_router, prefix="/api/forms")
except Exception as e:
    print("Warning: form api routes not loaded:", e)

# Slider routes are now registered via api.routes.slider_routes above

try:
    from controllers.categoryController import router as category_router
    app.include_router(category_router, prefix="/api")
except Exception as e:
    print("Warning: category routes not loaded:", e)

try:
    from controllers.settingsController import router as settings_router
    app.include_router(settings_router, prefix="/api")
except Exception as e:
    print("Warning: settings routes not loaded:", e)

try:
    from controllers.pageController import router as page_router
    app.include_router(page_router, prefix="/api")
except Exception as e:
    print("Warning: page routes not loaded:", e)

try:
    from controllers.mediaController import router as media_router
    app.include_router(media_router, prefix="/api")
except Exception as e:
    print("Warning: media routes not loaded:", e)

try:
    from controllers.productController import router as product_controller_router
    app.include_router(product_controller_router, prefix="/api")
except Exception as e:
    print("Warning: product controller routes not loaded:", e)

# =============================================================================
# DIRECT ENDPOINTS (bypassing route files to avoid import errors)
# =============================================================================
try:
    from controllers.category_controller import (
        get_categories,
        get_category_by_id,
        create_category,
        update_category,
        delete_category,
    )

    @app.get("/api/categories")
    async def api_get_categories():
        return await get_categories()

    @app.get("/api/categories/{category_id}")
    async def api_get_category(category_id: str):
        return await get_category_by_id(category_id)

    @app.post("/api/categories")
    async def api_create_category(data: dict):
        return await create_category(data)

    @app.put("/api/categories/{category_id}")
    async def api_update_category(category_id: str, data: dict):
        return await update_category(category_id, data)

    @app.delete("/api/categories/{category_id}")
    async def api_delete_category(category_id: str):
        return await delete_category(category_id)
except Exception as e:
    print("Warning: category direct endpoints not loaded:", e)

try:
    from controllers.media_controller import get_media_list, delete_media
    from middleware.auth_middleware import protect
    from fastapi import Body, HTTPException

    def check_media_permission(user: dict):
        """Check if user can manage media"""
        is_admin = user.get("role") == "admin" or user.get("isAdmin") is True
        if is_admin:
            return True
        custom_role = user.get("customRole")
        if custom_role and isinstance(custom_role, dict):
            permissions = custom_role.get("permissions", [])
            permission_ids = [p if isinstance(p, str) else p.get("id") or p.get("name") for p in permissions]
            return "media" in permission_ids
        return False

    @app.get("/api/media")
    async def api_get_media(page: int = 1, limit: int = 24, search: str = None, type: str = None, all: bool = False):
        return await get_media_list(page, limit, search, type, all)

    @app.delete("/api/media/{media_id}")
    async def api_delete_media_item(media_id: str):
        return await delete_media(media_id)
    
    @app.post("/api/media/bulk")
    async def api_bulk_delete_media(payload: dict = Body(...), user=Depends(protect)):
        """Bulk delete multiple media files"""
        if not check_media_permission(user):
            raise HTTPException(status_code=403, detail="You don't have permission to delete media")
        
        try:
            media_ids = payload.get("ids", [])
            
            if not media_ids or not isinstance(media_ids, list):
                raise HTTPException(status_code=400, detail="ids must be a non-empty array")
            
            deleted_count = 0
            errors = []
            
            for media_id in media_ids:
                try:
                    result = await delete_media(media_id)
                    if result.get("success"):
                        deleted_count += 1
                    else:
                        errors.append(f"{media_id}: {result.get('error', 'Unknown error')}")
                except Exception as e:
                    errors.append(f"{media_id}: {str(e)}")
            
            return {
                "success": True,
                "deleted": deleted_count,
                "total": len(media_ids),
                "message": f"Successfully deleted {deleted_count}/{len(media_ids)} media files",
                "errors": errors if errors else None
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Bulk delete failed: {str(e)}")

except Exception as e:
    print("Warning: media direct endpoints not loaded:", e)

try:
    from controllers.settingsController import get_settings, update_settings

    @app.get("/api/settings")
    async def api_get_settings():
        return await get_settings()

    @app.put("/api/settings")
    async def api_update_settings(data: dict):
        return await update_settings(data)
    
    @app.patch("/api/settings")
    async def api_patch_settings(data: dict):
        return await update_settings(data)
except Exception as e:
    print("Warning: settings direct endpoints not loaded:", e)

try:
    from controllers.sitemap_controller import generate_sitemap

    @app.get("/sitemap.xml")
    async def public_sitemap_xml():
        return await generate_sitemap()

    @app.get("/sitemap")
    async def public_sitemap():
        return await generate_sitemap()
except Exception as e:
    print("Warning: public sitemap endpoints not loaded:", e)

try:
    from controllers.gmc_feed_controller import generate_gmc_feed

    @app.get("/gmc-feed")
    async def public_gmc_feed():
        return await generate_gmc_feed()

    @app.get("/gmc-feed.xml")
    async def public_gmc_feed_xml():
        return await generate_gmc_feed()
except Exception as e:
    print("Warning: public GMC feed endpoints not loaded:", e)

# Add direct login endpoint
@app.get("/api/users/profile")
async def api_user_profile(request: Request):
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"error": "Missing or invalid token"})
    token = auth_header.split(" ", 1)[1]
    try:
        from middleware.auth_middleware import decode_token
        from bson import ObjectId
        payload = decode_token(token)
        user_id = payload.get("id") or payload.get("_id") or payload.get("sub")
        if not user_id:
            return JSONResponse(status_code=401, content={"error": "Invalid token"})

        coll = db.get_collection("users")
        queries = []
        try:
            queries.append({"_id": ObjectId(str(user_id))})
        except Exception:
            pass
        queries.extend([
            {"_id": str(user_id)},
            {"id": str(user_id)},
        ])

        user = None
        for query in queries:
            user = coll.find_one(query)
            if user:
                break

        if not user:
            return JSONResponse(status_code=401, content={"error": "User not found"})
        return {
            "id": str(user.get("_id")),
            "email": user.get("email"),
            "username": user.get("username"),
            "name": user.get("name"),
            "role": user.get("role", "user"),
            "isAdmin": user.get("isAdmin", False),
            "customRole": user.get("customRole"),
        }
    except Exception as e:
        print(f"profile error: {e}")
        return JSONResponse(status_code=401, content={"error": "Invalid token or profile fetch failed"})
@app.post("/api/users/login")
async def api_login(credentials: dict):
    try:
        def _authenticate():
            try:
                from bcrypt import checkpw, hashpw
            except ImportError:
                checkpw = None
            coll = db.get_collection("users")
            email = credentials.get("email") or credentials.get("username")
            password = credentials.get("password")
            if not email or not password:
                print("[LOGIN ERROR] Missing email or password")
                return {"error": "Email/username and password required"}
            user = coll.find_one({"$or": [{"email": email}, {"username": email}]})
            if not user:
                print("[LOGIN ERROR] User not found")
                return {"error": "Invalid credentials"}
            stored_password = user.get("password", "")
            # Try bcrypt verification first (if password is hashed)
            if checkpw and isinstance(stored_password, str) and stored_password.startswith("$2"):
                try:
                    if checkpw(password.encode(), stored_password.encode()):
                        pass
                    else:
                        print("[LOGIN ERROR] Bcrypt password mismatch")
                        return {"error": "Invalid credentials"}
                except Exception as err:
                    print(f"[LOGIN ERROR] Bcrypt exception: {err}")
                    return {"error": "Invalid credentials"}
            elif stored_password != password:
                print("[LOGIN ERROR] Plaintext password mismatch")
                return {"error": "Invalid credentials"}
            try:
                from jose import jwt
                token = jwt.encode({"id": str(user.get("_id"))}, os.getenv("JWT_SECRET", "eerkinstech"), algorithm="HS256")
            except Exception as jwt_err:
                print(f"[LOGIN ERROR] JWT generation failed: {jwt_err}")
                return {"error": "Token generation failed"}
            # Get custom role and permissions
            role = user.get("role", "user")
            is_admin = user.get("isAdmin", False)
            custom_role = user.get("customRole")
            permissions = []
            
            # If user is an employee without a role, try to assign default "Employee" role
            if role == 'employee' and not is_admin and not custom_role:
                print(f"[AUTH] Employee {email} has no role, attempting to assign default Employee role...")
                roles_coll = db.get_collection("roles")
                default_role = roles_coll.find_one({"name": "Employee"})
                
                if default_role:
                    print(f"[AUTH] Found Employee role: {default_role.get('_id')}")
                    from bson import ObjectId
                    custom_role = {
                        "id": str(default_role.get("_id")),
                        "name": default_role.get("name"),
                        "permissions": default_role.get("permissions", []),
                    }
                    permissions = custom_role.get("permissions", [])
                    
                    # Update user document in database with the default role
                    try:
                        user_id = ObjectId(user.get("_id"))
                        print(f"[AUTH] Updating user {email} with custom role...")
                        result = coll.update_one(
                            {"_id": user_id},
                            {"$set": {"customRole": custom_role}}
                        )
                        print(f"[AUTH] ✓ Updated {result.modified_count} document(s)")
                    except Exception as e:
                        print(f"[AUTH] Error updating user: {type(e).__name__}: {e}")
                else:
                    print(f"[AUTH] ERROR: Employee role not found in database!")
            elif isinstance(custom_role, dict):
                permissions = custom_role.get("permissions", [])
            
            print(f"[AUTH] Login response for {email}: customRole={custom_role is not None}, permissions={len(permissions)}")
            
            user_data = {
                "id": str(user.get("_id")),
                "email": user.get("email"),
                "username": user.get("username"),
                "name": user.get("name"),
                "role": role,
                "isAdmin": is_admin,
                "customRole": custom_role,
                "permissions": permissions,
                "token": token,
            }
            return user_data
        result = await run_in_threadpool(_authenticate)
        if "error" in result:
            print(f"[LOGIN ERROR] {result['error']}")
            return JSONResponse(status_code=401, content=result)
        return result
    except Exception as e:
        print(f"[LOGIN ERROR] Exception: {e}")
        return JSONResponse(status_code=500, content={"error": "Login failed"})

# Debug: Print all registered routes (AFTER all API routes are registered)
print("\n[STARTUP] === ALL REGISTERED ROUTES ===")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"  {route.methods} {route.path}")
print("[STARTUP] === END ROUTES ===\n")

# =============================================================================
# TEST ENDPOINTS & API ENDPOINTS MUST BE BEFORE REACT SERVING
# =============================================================================
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "server": "hello world"}

# Direct orders endpoint for testing
@app.get("/api/orders")
async def get_all_orders_direct():
    """Get all orders - direct endpoint"""
    try:
        from bson import ObjectId
        from datetime import datetime
        def _serialize(doc):
            if doc is None:
                return None
            def _walk(o):
                if isinstance(o, ObjectId):
                    return str(o)
                if isinstance(o, datetime):
                    return o.isoformat()
                if isinstance(o, dict):
                    return {k: _walk(v) for k, v in o.items()}
                if isinstance(o, list):
                    return [_walk(i) for i in o]
                return o
            return _walk(doc)
        
        coll = db.get_collection("orders")
        cursor = coll.find({}).sort("_id", -1)
        orders = [_serialize(o) for o in cursor]
        print(f"[Direct Orders Endpoint] Returned {len(orders)} orders")
        return orders
    except Exception as e:
        print(f"[Direct Orders Endpoint] Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/test-post")
async def test_post_endpoint():
    """Test POST endpoint to debug 405 issues"""
    return {"message": "POST works!"}

# =============================================================================
# UPLOAD ENDPOINT (Fallback)
# =============================================================================
from fastapi import File, UploadFile
from fastapi.responses import JSONResponse

@app.post("/api/upload")
async def upload_file(image: UploadFile = File(...)):
    """Direct upload endpoint - accepts 'image' field from frontend"""
    try:
        print(f"\n[main.py] ===== UPLOAD REQUEST =====")
        print(f"[main.py] File: {image.filename}")
        print(f"[main.py] Content-Type: {image.content_type}")
        
        # Import and call upload_media
        try:
            from controllers.media_controller import upload_media
            result = await upload_media(image)
            print(f"[main.py] ✓ Upload successful!")
            return JSONResponse(content=result, status_code=200)
        except Exception as e:
            print(f"[main.py] ✗ Error calling upload_media: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Fallback: save file directly
            import uuid
            import shutil
            
            if not os.path.exists(uploads_folder):
                os.makedirs(uploads_folder)
            
            file_ext = os.path.splitext(image.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(uploads_folder, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            print(f"[main.py] ✓ File saved (fallback): {unique_filename}")
            return JSONResponse(
                content={
                    "success": True,
                    "filename": unique_filename,
                    "original_filename": image.filename,
                    "type": "image" if image.content_type.startswith("image") else "video",
                    "url": f"/uploads/{unique_filename}",
                },
                status_code=200
            )
    except Exception as e:
        print(f"[main.py] ✗ Upload failed: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

# =============================================================================
# SERVE REACT BUILD (AT THE END, AFTER ALL API ROUTES)
# =============================================================================
# Serve uploaded media files first
uploads_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
if os.path.exists(uploads_folder):
    app.mount("/uploads", StaticFiles(directory=uploads_folder), name="uploads")

# Now mount React assets and catch-all (AFTER all API endpoints)
dist_folder = os.path.abspath("../client/dist")
client_folder = os.path.abspath("../client")

if os.path.exists(dist_folder):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_folder, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str, request: Request):
        # Never serve React HTML for API or uploads paths – those must be handled by FastAPI routes
        if full_path.startswith("api") or full_path.startswith("uploads"):
            raise HTTPException(status_code=404, detail="Not Found")

        # Serve React frontend for all other non-API paths
        file_path = os.path.join(dist_folder, full_path)

        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        request_path = "/" if not full_path else f"/{full_path.strip('/')}"
        metadata = build_route_seo(request_path, request)
        use_vite_template = request.headers.get("x-use-vite-template") == "1"
        bot_mode = is_bot_request(request)
        template_path = (
            os.path.join(client_folder, "index.html")
            if use_vite_template
            else os.path.join(dist_folder, "index.html")
        )
        rendered_html = render_index_html(load_html_template(template_path), metadata, bot_mode=bot_mode)
        return HTMLResponse(content=rendered_html)

# =============================================================================
# START SERVER
# =============================================================================
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        reload=False,  # Disable reload to prevent caching issues
    )
