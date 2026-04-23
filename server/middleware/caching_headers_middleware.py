"""
Caching Headers Middleware - Adds proper Cache-Control headers to all responses
Based on route type and content nature
"""
from starlette.datastructures import MutableHeaders


class CachingHeadersMiddleware:
    """
    ASGI-native middleware to add cache-control headers by route type.

    This avoids BaseHTTPMiddleware response-stream wrapping issues that can
    produce Content-Length protocol mismatches in production under compression.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = (scope.get("path") or "").lower()

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)

                # Skip if route already set explicit caching policy.
                if not headers.get("cache-control"):
                    # Static assets - cache for 1 year (long-term)
                    if path.endswith((".css", ".js", ".woff", ".woff2", ".ttf", ".eot", ".svg")):
                        headers["Cache-Control"] = "public, max-age=31536000, immutable"
                        headers["Vary"] = "Accept-Encoding"

                    # Images - cache for 24 hours
                    elif path.endswith((".jpg", ".jpeg", ".png", ".gif", ".webp", ".ico")):
                        headers["Cache-Control"] = "public, max-age=86400"
                        headers["Vary"] = "Accept-Encoding"

                    # API endpoints - varies by content
                    elif path.startswith("/api/"):
                        # Product endpoints can be cached (products don't change that often)
                        if "/product" in path:
                            headers["Cache-Control"] = "public, max-age=3600"  # 1 hour
                        # Cart/checkout endpoints - no cache
                        elif any(x in path for x in ("/cart", "/checkout", "/order")):
                            headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
                            headers["Pragma"] = "no-cache"
                        # Category/category endpoints - cache for 6 hours
                        elif "/categor" in path:
                            headers["Cache-Control"] = "public, max-age=21600"
                        # Default API cache (auth, settings, etc) - 5 minutes
                        else:
                            headers["Cache-Control"] = "public, max-age=300"
                    else:
                        content_type = (headers.get("content-type") or "").lower()
                        # HTML pages - cache for 1 hour, revalidate
                        if content_type.startswith("text/html"):
                            headers["Cache-Control"] = "public, max-age=3600, must-revalidate"
                        # JSON responses - 5 minute default
                        elif content_type.startswith("application/json"):
                            headers["Cache-Control"] = "public, max-age=300"

                # Add Vary header for Accept-Encoding when not set.
                if "vary" not in headers and not path.endswith((".woff", ".woff2", ".ttf")):
                    headers["Vary"] = "Accept-Encoding"

            await send(message)

        await self.app(scope, receive, send_wrapper)
