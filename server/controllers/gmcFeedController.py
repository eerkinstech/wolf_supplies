import re
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


def strip_html(value) -> str:
    text = "" if value is None else str(value)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def abs_url(path: str) -> str:
    if not path:
        return ""
    return path if path.startswith("http") else f"{SITE_URL}{path}"


def variant_key(values: dict) -> str:
    parts = []
    for key in sorted((values or {}).keys()):
        val = values.get(key)
        if val is None or str(val).strip() == "":
            continue
        parts.append(f"{key}:{val}")
    return "|".join(parts)


def xml_tag(name: str, value, cdata: bool = False) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    if not text:
        return ""
    if cdata:
        return f"<{name}><![CDATA[{text}]]></{name}>"
    return f"<{name}>{escape_xml(text)}</{name}>"


def build_title(base_name: str, values: dict) -> str:
    variant_parts = []
    for key, value in (values or {}).items():
        if value is None or str(value).strip() == "":
            continue
        variant_parts.append(str(value).strip())
    return base_name if not variant_parts else f"{base_name} - {' - '.join(variant_parts)}"


def choose_main_image(product: dict, variant: dict | None = None) -> str:
    if variant and variant.get("image"):
        return abs_url(str(variant.get("image")))
    if product.get("image"):
        return abs_url(str(product.get("image")))
    images = product.get("images") or []
    if isinstance(images, list) and images:
        return abs_url(str(images[0]))
    return f"{SITE_URL}/default-product-image.jpg"


def additional_images(product: dict, main_image: str, variant: dict | None = None) -> list[str]:
    images = []
    if variant and variant.get("image"):
        images.append(abs_url(str(variant.get("image"))))
    raw_images = product.get("images") or []
    if not isinstance(raw_images, list):
        raw_images = [raw_images] if raw_images else []
    images.extend(abs_url(str(img)) for img in raw_images if img)

    seen = set()
    out = []
    for img in images:
        if not img or img == main_image or img in seen:
            continue
        seen.add(img)
        out.append(img)
    return out[:10]


def build_product_link(product: dict, values: dict) -> str:
    slug = (product.get("slug") or "").strip("/")
    base = f"{SITE_URL}/product/{slug}"
    params = []
    for key, value in (values or {}).items():
        if value is None or str(value).strip() == "":
            continue
        params.append((key, str(value)))
    if not params:
        return base
    from urllib.parse import urlencode
    return f"{base}?{urlencode(params)}"


async def generate_gmc_feed():
    try:
        products_coll = db.get_collection("products")
        categories_coll = db.get_collection("categories")

        products = list(products_coll.find({"isDraft": {"$ne": True}}))
        categories = list(categories_coll.find({}, {"name": 1}))
        category_name_map = {str(cat["_id"]): cat.get("name", "") for cat in categories if cat.get("_id")}

        channel_header = """
    <title>Wolf Supplies</title>
    <link>https://wolfsupplies.co.uk</link>
    <description>Google Merchant Center product feed for Wolf Supplies</description>
        """

        items_xml = []

        for product in products:
            slug = (product.get("slug") or "").strip("/")
            if not slug:
                continue

            base_name = str(product.get("name") or "").strip()
            description = strip_html(product.get("description") or base_name)
            item_group_id = str(product.get("sku") or product.get("_id") or slug)

            category_names = []
            for cat in product.get("categories") or []:
                cat_id = str(cat.get("_id")) if isinstance(cat, dict) and cat.get("_id") else str(cat)
                if category_name_map.get(cat_id):
                    category_names.append(category_name_map[cat_id])
            product_type = " > ".join(category_names)

            variants = product.get("variantCombinations") or []
            if variants:
                for index, variant in enumerate(variants):
                    values = variant.get("variantValues") or {}
                    title = build_title(base_name, values)
                    main_image = choose_main_image(product, variant)
                    addl_images = additional_images(product, main_image, variant)
                    price = float(variant.get("price") or product.get("price") or 0)
                    stock = int(variant.get("stock") or 0)
                    sku = str(variant.get("sku") or "").strip()
                    variant_id = sku or f"{item_group_id}-{index + 1}"
                    link = build_product_link(product, values)

                    color = values.get("Colour") or values.get("Color")
                    size = values.get("Size")
                    material = values.get("Material")
                    pattern = values.get("Pattern")

                    item_xml = [
                        "    <item>",
                        xml_tag("g:id", variant_id),
                        xml_tag("title", title, cdata=True),
                        xml_tag("description", description, cdata=True),
                        xml_tag("link", link),
                        xml_tag("g:image_link", main_image),
                        xml_tag("g:item_group_id", item_group_id),
                        xml_tag("g:availability", "in stock" if stock > 0 else "out of stock"),
                        xml_tag("g:price", f"{price:.2f} GBP"),
                        xml_tag("g:condition", "new"),
                        xml_tag("g:brand", product.get("brand") or "Wolf Supplies"),
                        xml_tag("g:identifier_exists", "no" if not sku else None),
                        xml_tag("g:mpn", sku),
                        xml_tag("g:product_type", product_type),
                        xml_tag("g:color", color),
                        xml_tag("g:size", size),
                        xml_tag("g:material", material),
                        xml_tag("g:pattern", pattern),
                    ]

                    for img in addl_images:
                        item_xml.append(xml_tag("g:additional_image_link", img))

                    for key, value in values.items():
                        if value is None or str(value).strip() == "":
                            continue
                        item_xml.append(
                            xml_tag("g:product_detail", f"{key}: {value}")
                        )

                    item_xml.append("    </item>")
                    items_xml.append("\n".join(part for part in item_xml if part))
            else:
                main_image = choose_main_image(product, None)
                addl_images = additional_images(product, main_image, None)
                price = float(product.get("price") or 0)
                stock = int(product.get("stock") or 0)
                sku = str(product.get("sku") or "").strip()
                item_id = sku or str(product.get("_id") or slug)
                link = f"{SITE_URL}/product/{slug}"

                item_xml = [
                    "    <item>",
                    xml_tag("g:id", item_id),
                    xml_tag("title", base_name, cdata=True),
                    xml_tag("description", description, cdata=True),
                    xml_tag("link", link),
                    xml_tag("g:image_link", main_image),
                    xml_tag("g:availability", "in stock" if stock > 0 else "out of stock"),
                    xml_tag("g:price", f"{price:.2f} GBP"),
                    xml_tag("g:condition", "new"),
                    xml_tag("g:brand", product.get("brand") or "Wolf Supplies"),
                    xml_tag("g:identifier_exists", "no" if not sku else None),
                    xml_tag("g:mpn", sku),
                    xml_tag("g:product_type", product_type),
                ]

                for img in addl_images:
                    item_xml.append(xml_tag("g:additional_image_link", img))

                item_xml.append("    </item>")
                items_xml.append("\n".join(part for part in item_xml if part))

        feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    {channel_header}
    {''.join(items_xml)}
  </channel>
</rss>"""

        return Response(content=feed, media_type="application/xml")
    except HTTPException:
        raise
    except Exception as e:
        print(f"gmcFeedController.generate_gmc_feed error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Error generating GMC feed")
