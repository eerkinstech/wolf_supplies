"""
Caching Headers Middleware - Adds proper Cache-Control headers to all responses
Based on route type and content nature
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class CachingHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add cache-control headers to responses based on route type.
    
    Rules:
    - Static assets (css, js, woff, png, etc): 1 year
    - API endpoints (starts with /api): 0 (no cache) by default, can be overridden per endpoint
    - HTML pages: 3600 seconds (1 hour)
    - Images: 86400 seconds (24 hours)
    """
    
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        path = request.url.path.lower()
        
        # Skip adding headers if already set
        if response.headers.get('Cache-Control'):
            return response
        
        # Static assets - cache for 1 year (long-term)
        if path.endswith(('.css', '.js', '.woff', '.woff2', '.ttf', '.eot', '.svg')):
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
            response.headers['Vary'] = 'Accept-Encoding'
        
        # Images - cache for 24 hours
        elif path.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.ico')):
            response.headers['Cache-Control'] = 'public, max-age=86400'
            response.headers['Vary'] = 'Accept-Encoding'
        
        # API endpoints - varies by content
        elif path.startswith('/api/'):
            # Product endpoints can be cached (products don't change that often)
            if '/product' in path:
                response.headers['Cache-Control'] = 'public, max-age=3600'  # 1 hour
            # Cart/checkout endpoints - no cache
            elif any(x in path for x in ['/cart', '/checkout', '/order']):
                response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, public, max-age=0'
                response.headers['Pragma'] = 'no-cache'
            # Category/category endpoints - cache for 6 hours
            elif '/categor' in path:
                response.headers['Cache-Control'] = 'public, max-age=21600'
            # Default API cache (auth, settings, etc) - 5 minutes
            else:
                response.headers['Cache-Control'] = 'public, max-age=300'
        
        # HTML pages - cache for 1 hour, revalidate
        elif response.headers.get('content-type', '').startswith('text/html'):
            response.headers['Cache-Control'] = 'public, max-age=3600, must-revalidate'
        
        # JSON responses - 5 minute default
        elif response.headers.get('content-type', '').startswith('application/json'):
            if not path.startswith('/api/'):
                response.headers['Cache-Control'] = 'public, max-age=300'
        
        # Add Vary header for Accept-Encoding
        if 'Vary' not in response.headers and not path.endswith(('.woff', '.woff2', '.ttf')):
            response.headers['Vary'] = 'Accept-Encoding'
        
        return response
