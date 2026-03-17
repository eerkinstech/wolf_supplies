from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class QuerySubmission(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    query_type: str = Field(default="other", regex="^(product_inquiry|shipping|returns|payment|technical|other)$")
    subject: str
    description: str
    order_number: Optional[str] = None
    attachments: Optional[List[str]] = []
    priority: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "name": "Jane Doe",
                "email": "jane.doe@example.com",
                "phone": "123-456-7890",
                "query_type": "product_inquiry",
                "subject": "Question about product X",
                "description": "I would like to know more about product X.",
                "order_number": "ORD12345",
                "attachments": ["https://example.com/file1.jpg"],
                "priority": "high"
            }
        }