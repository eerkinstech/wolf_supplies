import jwt
import os
from datetime import datetime, timedelta

def generate_token(user_id):
    secret = os.getenv("JWT_SECRET", "changeme")
    expiration = datetime.utcnow() + timedelta(days=30)
    payload = {"id": user_id, "exp": expiration}
    return jwt.encode(payload, secret, algorithm="HS256")

