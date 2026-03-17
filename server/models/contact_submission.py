from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class Message(BaseModel):
    sender: str  # 'user' or 'admin'
    sender_name: str
    sender_email: EmailStr
    sender_phone: Optional[str]
    sender_id: Optional[str]  # Reference to User ID
    subject: Optional[str]
    message: str
    is_read: bool = False
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContactSubmission(BaseModel):
    conversation_id: str  # Unique conversation ID
    messages: list[Message] = []