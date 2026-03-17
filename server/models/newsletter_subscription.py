from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class NewsletterSubscription(BaseModel):
    id: Optional[str]  # MongoDB ObjectId
    email: EmailStr
    status: str = Field(default="subscribed", regex="^(subscribed|unsubscribed|bounced)$")
    verification_token: Optional[str]
    verified: bool = False
    verified_at: Optional[datetime]
    unsubscribed_at: Optional[datetime]
    last_email_sent_at: Optional[datetime]
    tags: List[str] = []
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)