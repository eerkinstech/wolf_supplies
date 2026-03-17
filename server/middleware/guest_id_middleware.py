from fastapi import Request, Response
from uuid import uuid4
from typing import Optional

# Middleware to handle guest ID
async def guest_id_middleware(request: Request, call_next):
    guest_id = request.cookies.get("guest_id")
    if not guest_id:
        guest_id = str(uuid4())
    response = await call_next(request)
    response.set_cookie(key="guest_id", value=guest_id, httponly=True, max_age=2 * 365 * 24 * 60 * 60)
    return response