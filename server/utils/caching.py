"""
Caching utilities for FastAPI endpoints.
Provides decorators and utilities for HTTP caching and response optimization.
"""
import hashlib
import inspect
import json
import time
from functools import wraps
from typing import Optional, Callable, Any
from datetime import datetime, timedelta

class CacheEntry:
    """Represents a cached response with TTL"""
    def __init__(self, data: Any, ttl: int = 300):
        self.data = data
        self.created_at = time.time()
        self.ttl = ttl
    
    def is_expired(self) -> bool:
        return time.time() - self.created_at > self.ttl
    
    def get_cache_headers(self) -> dict:
        """Generate appropriate Cache-Control headers"""
        return {
            "Cache-Control": f"public, max-age={self.ttl}",
            "ETag": hashlib.md5(json.dumps(self.data, sort_keys=True, default=str).encode()).hexdigest(),
        }


class ResponseCache:
    """In-memory response cache with TTL support"""
    def __init__(self):
        self.cache = {}
    
    def generate_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Generate cache key from function name and arguments"""
        key_parts = [func_name]
        key_parts.extend(str(arg) for arg in args if arg not in (None,))
        key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()) if v not in (None,))
        return "|".join(key_parts)
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value if not expired"""
        if key in self.cache:
            entry = self.cache[key]
            if not entry.is_expired():
                return entry
            del self.cache[key]
        return None
    
    def set(self, key: str, data: Any, ttl: int = 300):
        """Set cache entry with TTL"""
        self.cache[key] = CacheEntry(data, ttl)
    
    def clear(self):
        """Clear all cache"""
        self.cache.clear()
    
    def cleanup_expired(self):
        """Remove expired entries"""
        expired_keys = [k for k, v in self.cache.items() if v.is_expired()]
        for key in expired_keys:
            del self.cache[key]


# Global cache instance
response_cache = ResponseCache()


def cached_endpoint(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator to cache endpoint responses
    
    Args:
        ttl: Time to live in seconds (default 5 minutes)
        key_prefix: Optional prefix for cache key
    
    Usage:
        @router.get("/products")
        @cached_endpoint(ttl=600)
        async def get_products():
            ...
    """
    def decorator(func: Callable) -> Callable:
        is_async = inspect.iscoroutinefunction(func)

        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Extract cacheable kwargs (skip non-serializable objects)
            cacheable_kwargs = {
                k: v for k, v in kwargs.items() 
                if isinstance(v, (str, int, float, bool, type(None)))
            }
            
            cache_key = response_cache.generate_key(
                f"{key_prefix}:{func.__name__}",
                args,
                cacheable_kwargs
            )
            
            # Try to get from cache
            cached_entry = response_cache.get(cache_key)
            if cached_entry:
                return cached_entry.data
            
            # Execute function
            result = await func(*args, **kwargs) if is_async else func(*args, **kwargs)
            
            # Store in cache
            response_cache.set(cache_key, result, ttl)
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            cacheable_kwargs = {
                k: v for k, v in kwargs.items() 
                if isinstance(v, (str, int, float, bool, type(None)))
            }
            
            cache_key = response_cache.generate_key(
                f"{key_prefix}:{func.__name__}",
                args,
                cacheable_kwargs
            )
            
            cached_entry = response_cache.get(cache_key)
            if cached_entry:
                return cached_entry.data
            
            result = func(*args, **kwargs)
            response_cache.set(cache_key, result, ttl)
            return result
        
        # Return appropriate wrapper
        if is_async:
            return async_wrapper
        return sync_wrapper
    
    return decorator


def get_cache_headers(ttl: int = 300, is_public: bool = True) -> dict:
    """
    Generate cache control headers
    
    Args:
        ttl: Time to live in seconds
        is_public: If True, allows caching by public caches (CDN, etc.)
    
    Returns:
        Dictionary of cache headers
    """
    cache_control = f"{'public' if is_public else 'private'}, max-age={ttl}"
    return {
        "Cache-Control": cache_control,
        "Vary": "Accept-Encoding, Accept-Language",
    }


def get_static_cache_headers(max_age: int = 31536000) -> dict:
    """Cache headers for static assets (1 year)"""
    return {
        "Cache-Control": f"public, max-age={max_age}, immutable",
        "Vary": "Accept-Encoding",
    }


def get_no_cache_headers() -> dict:
    """Headers to prevent caching"""
    return {
        "Cache-Control": "no-cache, no-store, must-revalidate, public, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
    }
