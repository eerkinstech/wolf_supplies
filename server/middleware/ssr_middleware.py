from fastapi import Request, Response
from fastapi.responses import HTMLResponse
from typing import Optional

# Middleware for server-side rendering (SSR)
async def ssr_middleware(request: Request, call_next):
    if request.url.path.startswith("/api") or request.url.path.startswith("/uploads"):
        return await call_next(request)

    # Mock meta tags and structured data
    meta_tags = """
    <meta name="description" content="Example description">
    <meta property="og:title" content="Example Title">
    <meta property="og:description" content="Example OG Description">
    """

    structured_data = """
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Example Page"
    }
    </script>
    """

    # Mock HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        {meta_tags}
        {structured_data}
    </head>
    <body>
        <h1>Welcome to the Example Page</h1>
    </body>
    </html>
    """

    return HTMLResponse(content=html_content)