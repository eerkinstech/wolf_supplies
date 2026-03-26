import csv
import html
import os
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient


ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / "server" / ".env")


def slugify(value: str) -> str:
    value = fix_text(value or "")
    value = value.lower().strip()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return re.sub(r"-{2,}", "-", value).strip("-") or "uncategorized"


def fix_text(value):
    if value is None:
        return ""
    if not isinstance(value, str):
        return value
    value = html.unescape(value).replace("\ufeff", "").strip()
    try:
        repaired = value.encode("latin1").decode("utf-8")
        if repaired.count("�") <= value.count("�"):
            value = repaired
    except Exception:
        pass
    return value


def parse_float(value, default=0.0):
    try:
        raw = str(value or "").strip().replace(",", "")
        return float(raw) if raw else default
    except Exception:
        return default


def parse_int(value, default=0):
    try:
        raw = str(value or "").strip().replace(",", "")
        return int(float(raw)) if raw else default
    except Exception:
        return default


def clean_option_name(value: str) -> str:
    value = fix_text(value)
    value = re.sub(r":\s*$", "", value).strip()
    return value


def is_real_option(name: str, value: str) -> bool:
    name = clean_option_name(name)
    value = fix_text(value).strip()
    if not name or not value:
        return False
    if name.lower() in {"title", "default title"}:
        return False
    if value.lower() in {"default title", "default"}:
        return False
    return True


def build_category_name(row: dict) -> str:
    type_name = fix_text(row.get("Type", "")).strip()
    if type_name:
        return type_name
    product_category = fix_text(row.get("Product Category", "")).strip()
    if product_category:
        return product_category.split(">")[-1].strip()
    return "Uncategorized"


def extract_images(rows: list[dict]) -> list[str]:
    ordered = []
    seen = set()
    sortable = []
    for row in rows:
        for field in ("Image Src", "Variant Image"):
            src = fix_text(row.get(field, "")).strip()
            if not src or src in seen:
                continue
            position = parse_int(row.get("Image Position"), 999999)
            sortable.append((position, src))
            seen.add(src)
    for _, src in sorted(sortable, key=lambda item: (item[0], item[1])):
        ordered.append(src)
    return ordered


def summarize_description(row: dict) -> str:
    body = fix_text(row.get("Body (HTML)", "")).strip()
    detail = fix_text(row.get("Detail (product.metafields.custom.detail)", "")).strip()
    spec_dims = fix_text(row.get("Spec & Dims (product.metafields.custom.spec_dims)", "")).strip()
    parts = [part for part in (body, detail, spec_dims) if part]
    return "\n".join(parts)


def extract_benefits(row: dict) -> str:
    features = fix_text(row.get("Features (product.metafields.custom.features)", "")).strip()
    return features


def build_variants(rows: list[dict]):
    variant_value_sets = defaultdict(set)
    variant_combinations = []
    option_name_defaults = {}

    for idx in (1, 2, 3):
        for row in rows:
            candidate = clean_option_name(row.get(f"Option{idx} Name", ""))
            if candidate:
                option_name_defaults[idx] = candidate
                break

    for row in rows:
        variant_values = {}
        for idx in (1, 2, 3):
            name = clean_option_name(row.get(f"Option{idx} Name", "")) or option_name_defaults.get(idx, "")
            value = row.get(f"Option{idx} Value", "")
            if is_real_option(name, value):
                cleaned_name = clean_option_name(name)
                cleaned_value = fix_text(value).strip()
                variant_values[cleaned_name] = cleaned_value
                variant_value_sets[cleaned_name].add(cleaned_value)

        combo = {
            "variantValues": variant_values,
            "sku": fix_text(row.get("Variant SKU", "")).strip(),
            "price": parse_float(row.get("Variant Price"), 0.0),
            "stock": parse_int(row.get("Variant Inventory Qty"), 0),
            "image": fix_text(row.get("Variant Image", "") or row.get("Image Src", "")).strip(),
        }

        if variant_values:
            variant_combinations.append(combo)

    variants = [
        {"name": name, "values": sorted(values)}
        for name, values in variant_value_sets.items()
        if values
    ]

    return variants, variant_combinations


def build_product_document(handle: str, rows: list[dict], category_id: str) -> dict:
    first = rows[0]
    title = fix_text(first.get("Title", "")).strip() or handle
    description = summarize_description(first)
    benefits = extract_benefits(first)
    tags = [fix_text(tag).strip() for tag in fix_text(first.get("Tags", "")).split(",") if fix_text(tag).strip()]
    images = extract_images(rows)
    variants, variant_combinations = build_variants(rows)

    variant_prices = [combo["price"] for combo in variant_combinations if combo.get("price") is not None]
    variant_stock = [combo["stock"] for combo in variant_combinations]
    simple_price = parse_float(first.get("Variant Price"), 0.0)
    simple_stock = parse_int(first.get("Variant Inventory Qty"), 0)
    compare_prices = [parse_float(row.get("Variant Compare At Price"), 0.0) for row in rows if str(row.get("Variant Compare At Price", "")).strip()]

    category_name = build_category_name(first)
    published = str(first.get("Published", "")).strip().lower() == "true"
    active = str(first.get("Status", "")).strip().lower() == "active"
    vendor = fix_text(first.get("Vendor", "")).strip()

    product = {
        "name": title,
        "slug": slugify(handle),
        "description": description,
        "price": min(variant_prices) if variant_prices else simple_price,
        "originalPrice": max(compare_prices) if compare_prices else None,
        "discount": 0,
        "stock": sum(variant_stock) if variant_stock else simple_stock,
        "images": images,
        "image": images[0] if images else "",
        "variants": variants,
        "variantCombinations": variant_combinations,
        "categories": [category_id],
        "category": category_name,
        "benefitsHeading": "Key Features",
        "benefits": benefits,
        "metaTitle": fix_text(first.get("SEO Title", "")).strip() or title,
        "metaDescription": fix_text(first.get("SEO Description", "")).strip(),
        "metaKeywords": ", ".join(dict.fromkeys(tags + [category_name, fix_text(first.get("Product Category", "")).strip()])),
        "isDraft": not (published and active),
        "rating": 0,
        "numReviews": parse_int(first.get("Product rating count (product.metafields.reviews.rating_count)"), 0),
        "sku": fix_text(first.get("Variant SKU", "")).strip(),
        "brand": vendor or "Wolf Supplies",
        "vendor": vendor or "Wolf Supplies",
        "type": category_name,
        "googleProductCategory": fix_text(first.get("Product Category", "")).strip(),
        "tags": tags,
        "handle": handle,
        "updatedAt": datetime.utcnow(),
    }

    if product["originalPrice"] is not None and product["originalPrice"] <= product["price"]:
        product["originalPrice"] = None

    product["inStock"] = product["stock"] > 0
    return product


def main():
    csv_path = ROOT / "products.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set in server/.env")

    client = MongoClient(database_url, serverSelectionTimeoutMS=10000)
    db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]
    products_coll = db.get_collection("products")
    categories_coll = db.get_collection("categories")

    grouped_rows = defaultdict(list)
    current_handle = ""
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            handle = fix_text(row.get("Handle", "")).strip() or current_handle
            if not handle:
                continue
            current_handle = handle
            normalized_row = dict(row)
            normalized_row["Handle"] = handle
            grouped_rows[handle].append(normalized_row)

    now = datetime.utcnow()
    created_categories = 0
    updated_products = 0
    created_products = 0
    category_ids_by_name = {}

    for handle, rows in grouped_rows.items():
        category_name = build_category_name(rows[0])
        category_slug = slugify(category_name)
        existing_category = categories_coll.find_one({"slug": category_slug})
        if not existing_category:
            category_doc = {
                "name": category_name,
                "slug": category_slug,
                "description": "",
                "parent": None,
                "image": "",
                "color": "",
                "meta_title": category_name,
                "meta_description": "",
                "meta_keywords": category_name,
                "subcategories": [],
                "level": "main",
                "createdAt": now,
                "updatedAt": now,
            }
            result = categories_coll.insert_one(category_doc)
            category_id = str(result.inserted_id)
            created_categories += 1
        else:
            category_id = str(existing_category["_id"])

        category_ids_by_name[category_name] = category_id
        product_doc = build_product_document(handle, rows, category_id)

        existing_product = products_coll.find_one({"slug": product_doc["slug"]})
        if existing_product:
            products_coll.update_one({"_id": existing_product["_id"]}, {"$set": product_doc})
            updated_products += 1
        else:
            product_doc["createdAt"] = now
            products_coll.insert_one(product_doc)
            created_products += 1

    print(
        {
            "csv_products": len(grouped_rows),
            "created_categories": created_categories,
            "total_categories_used": len(category_ids_by_name),
            "created_products": created_products,
            "updated_products": updated_products,
        }
    )


if __name__ == "__main__":
    main()
