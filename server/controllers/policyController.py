from fastapi import APIRouter, HTTPException
from models.policy import Policy
from pydantic import BaseModel
from typing import List

router = APIRouter()

class PolicyResponse(BaseModel):
    title: str
    slug: str
    description: str
    content: str
    metaDescription: str
    metaKeywords: List[str]

@router.get("/policies", response_model=List[PolicyResponse])
async def get_all_policies():
    try:
        policies = await Policy.find({"isPublished": True}).to_list(length=None)
        return policies
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching policies")

@router.get("/policies/{slug}", response_model=PolicyResponse)
async def get_policy(slug: str):
    try:
        policy = await Policy.find_one({"slug": slug})
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        return policy
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching policy")

