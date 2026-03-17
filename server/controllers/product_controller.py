from fastapi import HTTPException

try:
    from .productController import (
        get_products as _get_products,
        get_product_by_id as _get_product_by_id,
        get_product_by_slug as _get_product_by_slug,
        create_product as _create_product,
        update_product as _update_product,
        delete_product as _delete_product,
    )
except Exception as e:
    print(f"Failed to import productController: {e}")
    _get_products = None
    _get_product_by_id = None
    _get_product_by_slug = None
    _create_product = None
    _update_product = None
    _delete_product = None

async def get_products(*args, **kwargs):
    if _get_products:
        return await _get_products(*args, **kwargs)
    raise HTTPException(status_code=501, detail="get_products not available")

async def get_product_by_id(product_id: str):
    if _get_product_by_id:
        return _get_product_by_id(product_id)
    raise HTTPException(status_code=501, detail="get_product_by_id not available")

async def get_product_by_slug(slug: str):
    if _get_product_by_slug:
        return _get_product_by_slug(slug)
    raise HTTPException(status_code=501, detail="get_product_by_slug not available")

async def create_product(data: dict, user=None):
    if _create_product:
        return _create_product(data, user)
    raise HTTPException(status_code=501, detail="create_product not available")

async def update_product(product_id: str, data: dict, user=None):
    if _update_product:
        return _update_product(product_id, data, user)
    raise HTTPException(status_code=501, detail="update_product not available")

async def delete_product(product_id: str, user=None):
    if _delete_product:
        return _delete_product(product_id, user)
    raise HTTPException(status_code=501, detail="delete_product not available")
