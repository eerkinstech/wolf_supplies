from fastapi import APIRouter, HTTPException
from typing import Optional
from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Please set it in your .env file.")
client = MongoClient(DATABASE_URL)
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]
contact_submissions_collection = db["contact_submissions"]

router = APIRouter()

# ===== Basic admin functions (for imports) =====
async def submit_form(data: dict):
    """Submit a contact form"""
    if not data.get("name") or not data.get("email") or not data.get("message"):
        raise HTTPException(status_code=400, detail="Name, email, and message are required")
    
    email_lower = data.get("email", "").lower()
    subject = data.get("subject", "Contact Form Submission")
    
    try:
        existing = contact_submissions_collection.find_one({"userEmail": email_lower})
        
        if not existing:
            document = {
                "userEmail": email_lower,
                "userName": data.get("name", ""),
                "userPhone": data.get("phone", ""),
                "subject": subject,
                "fromContactForm": True,
                "messages": [
                    {
                        "sender": "user",
                        "content": data.get("message", ""),
                        "subject": subject,
                        "createdAt": datetime.utcnow()
                    }
                ],
                "createdAt": datetime.utcnow(),
                "lastMessageAt": datetime.utcnow(),
                "lastMessageSender": "user"
            }
            contact_submissions_collection.insert_one(document)
        else:
            # Add message to existing conversation
            contact_submissions_collection.update_one(
                {"_id": existing["_id"]},
                {
                    "$push": {
                        "messages": {
                            "sender": "user",
                            "content": data.get("message", ""),
                            "subject": subject,
                            "createdAt": datetime.utcnow()
                        }
                    },
                    "$set": {
                        "lastMessageAt": datetime.utcnow(),
                        "lastMessageSender": "user"
                    }
                }
            )
        
        return {"success": True, "message": "Contact form submitted successfully"}
    except Exception as e:
        print(f"[formController.submit_form] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_form_submissions(user=None):
    """Get all form submissions"""
    try:
        submissions = list(contact_submissions_collection.find())
        return [_serialize_submission(s) for s in submissions]
    except Exception as e:
        print(f"[formController.get_form_submissions] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== Chat/Conversation functions =====
async def get_all_contact_conversations(limit: int = 100, status: str = "all"):
    """Get all contact conversations for admin"""
    try:
        print(f"[formController.get_all_contact_conversations] Fetching conversations, limit={limit}, status={status}")
        conversations = list(contact_submissions_collection.find().limit(limit))
        print(f"[formController.get_all_contact_conversations] Found {len(conversations)} conversations")
        
        result = []
        for conv in conversations:
            serialized = _serialize_submission(conv)
            result.append(serialized)
        
        print(f"[formController.get_all_contact_conversations] Returning {len(result)} serialized conversations")
        return {"success": True, "data": result}
    except Exception as e:
        print(f"[formController.get_all_contact_conversations] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

async def get_contact_conversation_by_id(conversation_id: str):
    """Get a specific conversation by ID"""
    try:
        print(f"[formController.get_contact_conversation_by_id] Fetching conversation: {conversation_id}")
        try:
            obj_id = ObjectId(conversation_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid conversation ID")
        
        conversation = contact_submissions_collection.find_one({"_id": obj_id})
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        serialized = _serialize_submission(conversation)
        print(f"[formController.get_contact_conversation_by_id] Found conversation: {serialized['_id']}")
        return {"success": True, "data": serialized}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[formController.get_contact_conversation_by_id] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

async def send_admin_message(data: dict):
    """Admin sends a message to a user"""
    try:
        user_email = data.get("userEmail", "").lower()
        message_text = data.get("message", "")
        sender_name = data.get("senderName", "Admin")
        
        print(f"[formController.send_admin_message] Sending message to {user_email}")
        
        if not user_email or not message_text:
            raise HTTPException(status_code=400, detail="Email and message are required")
        
        conversation = contact_submissions_collection.find_one({"userEmail": user_email})
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Add admin message
        contact_submissions_collection.update_one(
            {"_id": conversation["_id"]},
            {
                "$push": {
                    "messages": {
                        "sender": "admin",
                        "content": message_text,
                        "message": message_text,
                        "senderName": sender_name,
                        "createdAt": datetime.utcnow(),
                        "isRead": True
                    }
                },
                "$set": {
                    "lastMessageAt": datetime.utcnow(),
                    "lastMessageSender": "admin"
                }
            }
        )
        
        # Fetch updated conversation
        updated_conv = contact_submissions_collection.find_one({"_id": conversation["_id"]})
        serialized = _serialize_submission(updated_conv)
        
        print(f"[formController.send_admin_message] Message sent successfully")
        return {"success": True, "data": serialized}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[formController.send_admin_message] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ===== Helper functions =====
def _serialize_submission(submission):
    """Serialize a submission document for JSON response"""
    if not submission:
        return None
    
    messages = submission.get("messages", [])
    # Serialize messages, ensuring all datetime objects are converted to strings
    serialized_messages = []
    for msg in messages:
        serialized_msg = dict(msg)
        if "createdAt" in serialized_msg and hasattr(serialized_msg["createdAt"], "isoformat"):
            serialized_msg["createdAt"] = serialized_msg["createdAt"].isoformat()
        serialized_messages.append(serialized_msg)
    
    last_message_at = submission.get("lastMessageAt", submission.get("createdAt", datetime.utcnow()))
    if hasattr(last_message_at, "isoformat"):
        last_message_at = last_message_at.isoformat()
    
    created_at = submission.get("createdAt", datetime.utcnow())
    if hasattr(created_at, "isoformat"):
        created_at = created_at.isoformat()
    
    return {
        "_id": str(submission.get("_id", "")),
        "userEmail": submission.get("userEmail", ""),
        "userName": submission.get("userName", ""),
        "userPhone": submission.get("userPhone", ""),
        "subject": submission.get("subject", ""),
        "messages": serialized_messages,
        "fromContactForm": submission.get("fromContactForm", False),
        "movedToChat": submission.get("movedToChat", False),
        "createdAt": created_at,
        "lastMessageAt": last_message_at,
        "lastMessageSender": submission.get("lastMessageSender", "user"),
        "messageCount": len(messages),
        "conversationId": str(submission.get("_id", ""))
    }
   
async def get_user_conversation(email: str):
    """Fetch user's conversation by email"""
    email_lower = email.lower()
    
    try:
        conversation = contact_submissions_collection.find_one({"userEmail": email_lower})
        
        if not conversation:
            # Return empty conversation structure if not found
            return {
                "success": True,
                "data": {
                    "_id": None,
                    "userEmail": email_lower,
                    "userName": "",
                    "userPhone": "",
                    "messages": [],
                    "fromContactForm": False,
                    "createdAt": None,
                    "lastMessageAt": None,
                    "lastMessageSender": "user",
                    "messageCount": 0
                }
            }
        
        serialized = _serialize_submission(conversation)
        print(f"[formController.get_user_conversation] Found conversation for {email_lower}")
        return {"success": True, "data": serialized}
    except Exception as e:
        print(f"[formController.get_user_conversation] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


async def send_user_message(data: dict):
    """User sends a message via chat widget"""
    email = data.get("email", "").lower()
    name = data.get("name", "")
    message = data.get("message", "")
    
    if not email or not message:
        raise HTTPException(status_code=400, detail="Email and message are required")
    
    try:
        existing = contact_submissions_collection.find_one({"userEmail": email})
        
        if not existing:
            # Create new conversation
            document = {
                "userEmail": email,
                "userName": name,
                "userPhone": data.get("phone", ""),
                "fromContactForm": False,
                "messages": [
                    {
                        "sender": "user",
                        "content": message,
                        "createdAt": datetime.utcnow()
                    }
                ],
                "createdAt": datetime.utcnow(),
                "lastMessageAt": datetime.utcnow(),
                "lastMessageSender": "user"
            }
            result = contact_submissions_collection.insert_one(document)
            document["_id"] = result.inserted_id
            serialized = _serialize_submission(document)
            print(f"[formController.send_user_message] Created new conversation for {email}")
        else:
            # Add message to existing conversation
            contact_submissions_collection.update_one(
                {"_id": existing["_id"]},
                {
                    "$push": {
                        "messages": {
                            "sender": "user",
                            "content": message,
                            "createdAt": datetime.utcnow()
                        }
                    },
                    "$set": {
                        "lastMessageAt": datetime.utcnow(),
                        "lastMessageSender": "user"
                    }
                }
            )
            # Fetch updated conversation
            updated_conv = contact_submissions_collection.find_one({"_id": existing["_id"]})
            serialized = _serialize_submission(updated_conv)
            print(f"[formController.send_user_message] Added message to conversation for {email}")
        
        return {"success": True, "data": serialized}
    except Exception as e:
        print(f"[formController.send_user_message] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


async def move_contact_to_chat(conversation_id: str):
    """Move a contact submission to chat tab"""
    from bson import ObjectId
    
    if not conversation_id:
        raise HTTPException(status_code=400, detail="Conversation ID is required")
    
    try:
        # Find and update the submission
        result = contact_submissions_collection.find_one_and_update(
            {"_id": ObjectId(conversation_id)},
            {
                "$set": {
                    "movedToChat": True,
                    "lastMessageAt": datetime.utcnow()
                }
            },
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        serialized = _serialize_submission(result)
        print(f"[formController.move_contact_to_chat] Moved conversation {conversation_id} to chat")
        return {"success": True, "data": serialized}
        
    except Exception as e:
        print(f"[formController.move_contact_to_chat] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/contact-form")
async def submit_contact_form(data: dict):
    """Submit a contact form"""
    return await submit_form(data)


