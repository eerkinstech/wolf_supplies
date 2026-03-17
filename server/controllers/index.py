from .auth_controller import router as auth_router
from .cart_controller import router as cart_router
from .category_controller import router as category_router
from .media_controller import router as media_router
from .order_controller import router as order_router
from .page_config_controller import router as page_config_router
from .payment_controller import router as payment_router
from .product_controller import router as product_router
from .settings_controller import router as settings_router
from .wishlist_controller import router as wishlist_router

__all__ = [
    "auth_router",
    "cart_router",
    "category_router",
    "media_router",
    "order_router",
    "page_config_router",
    "payment_router",
    "product_router",
    "settings_router",
    "wishlist_router",
]

