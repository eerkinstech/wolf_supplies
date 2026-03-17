from fastapi import APIRouter, Depends, Query, Body
from controllers.formController import (
    submit_form,
    get_form_submissions,
    get_all_contact_conversations,
    get_contact_conversation_by_id,
    send_admin_message,
    get_user_conversation,
    send_user_message,
    move_contact_to_chat
)
from middleware.auth_middleware import protect, admin

router = APIRouter()

@router.post("/")
async def submit(data: dict = Body(...)):
    return await submit_form(data)

@router.get("/submissions")
async def fetch_submissions(user=Depends(admin)):
    return await get_form_submissions(user)

# Admin Chat Routes
@router.get("/contact")
async def fetch_conversations(
    limit: int = Query(100),
    status: str = Query("all")
):
    """Fetch all conversations for admin chat"""
    return await get_all_contact_conversations(limit=limit, status=status)

# User Chat Widget Routes - Must come BEFORE {conversation_id} to avoid matching conflict
@router.get("/contact/user")
async def fetch_user_conversation(email: str = Query(...)):
    """Fetch user's conversation by email (for chat widget)"""
    return await get_user_conversation(email)

@router.get("/contact/{conversation_id}")
async def fetch_conversation(
    conversation_id: str
):
    """Fetch a specific conversation by ID"""
    return await get_contact_conversation_by_id(conversation_id)

@router.post("/contact/admin/send")
async def send_message(data: dict = Body(...)):
    """Admin sends a message in a conversation"""
    return await send_admin_message(data)

@router.patch("/contact/{conversation_id}/moveToChat")
async def move_to_chat(conversation_id: str):
    """Move a contact submission to chat"""
    return await move_contact_to_chat(conversation_id)

@router.post("/chat")
async def send_chat_message(data: dict = Body(...)):
    """User sends a message via chat widget"""
    return await send_user_message(data)