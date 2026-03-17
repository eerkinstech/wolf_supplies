from fastapi import HTTPException
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os

client = MongoClient(os.getenv("DATABASE_URL", "mongodb://localhost:27017"))
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]

def _serialize(doc: dict):
    if doc is None:
        return None
    def _walk(o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        if isinstance(o, dict):
            return {k: _walk(v) for k, v in o.items()}
        if isinstance(o, list):
            return [_walk(i) for i in o]
        return o
    return _walk(doc)

# Get all orders (admin only)
async def get_all_orders():
    try:
        coll = db.get_collection("orders")
        cursor = coll.find({}).sort("_id", -1)
        orders = [_serialize(o) for o in cursor]
        print(f"[order_controller] get_all_orders returned {len(orders)} orders")
        return orders
    except Exception as e:
        print(f"Error fetching orders: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

# Get user's orders
async def get_user_orders(user_id: str):
    try:
        coll = db.get_collection("orders")
        cursor = coll.find({"user": ObjectId(user_id)}).sort("createdAt", -1)
        orders = [_serialize(o) for o in cursor]
        return orders
    except Exception as e:
        print(f"Error fetching user orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching user orders: {str(e)}")

# Get orders by guestId
async def get_orders_by_guest_id(guest_id: str):
    try:
        coll = db.get_collection("orders")
        cursor = coll.find({"guestId": guest_id}).sort("createdAt", -1)
        orders = [_serialize(o) for o in cursor]
        return orders
    except Exception as e:
        print(f"Error fetching guest orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching guest orders: {str(e)}")

# Get single order by ID
async def get_order_by_id(order_id: str):
    try:
        coll = db.get_collection("orders")
        # Try by orderId first (guest order), then by _id
        order = coll.find_one({"orderId": order_id})
        if not order and ObjectId.is_valid(order_id):
            order = coll.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return _serialize(order)
    except Exception as e:
        print(f"Error fetching order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching order: {str(e)}")

# Create new order
async def create_order(data: dict, user=None):
    try:
        coll = db.get_collection("orders")
        order_doc = {
            "orderId": data.get("orderId", f"ORD-{ObjectId()}"),
            "user": ObjectId(user.get("id")) if user and user.get("id") else None,
            "guestId": data.get("guestId"),
            "orderItems": data.get("orderItems", []),
            "contactDetails": data.get("contactDetails", {}),
            "shippingAddress": data.get("shippingAddress", {}),
            "billingAddress": data.get("billingAddress"),
            "paymentMethod": data.get("paymentMethod"),
            "itemsPrice": data.get("itemsPrice", 0),
            "taxPrice": data.get("taxPrice", 0),
            "shippingPrice": data.get("shippingPrice", 0),
            "totalPrice": data.get("totalPrice", data.get("totalAmount", 0)),
            "status": "pending",
            "createdAt": datetime.now(),
        }
        result = coll.insert_one(order_doc)
        order_doc["_id"] = str(result.inserted_id)
        return _serialize(order_doc)
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

# Update order status
async def update_order_status(order_id: str, data: dict, user=None):
    try:
        coll = db.get_collection("orders")
        order_oid = ObjectId(order_id) if ObjectId.is_valid(order_id) else None
        query = {"_id": order_oid} if order_oid else {"orderId": order_id}
        update = {"$set": {"status": data.get("status"), "updatedAt": datetime.now()}}
        result = coll.find_one_and_update(query, update, return_document=True)
        if not result:
            raise HTTPException(status_code=404, detail="Order not found")
        return _serialize(result)
    except Exception as e:
        print(f"Error updating order status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")

# Update fulfillment status
async def update_fulfillment_status(order_id: str, data: dict, user=None):
    try:
        coll = db.get_collection("orders")
        order_oid = ObjectId(order_id) if ObjectId.is_valid(order_id) else None
        query = {"_id": order_oid} if order_oid else {"orderId": order_id}
        update = {"$set": {"fulfillmentStatus": data.get("fulfillmentStatus"), "updatedAt": datetime.now()}}
        result = coll.find_one_and_update(query, update, return_document=True)
        if not result:
            raise HTTPException(status_code=404, detail="Order not found")
        return _serialize(result)
    except Exception as e:
        print(f"Error updating fulfillment status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating fulfillment status: {str(e)}")

# Update delivery status
async def update_delivery_status(order_id: str, data: dict, user=None):
    try:
        coll = db.get_collection("orders")
        order_oid = ObjectId(order_id) if ObjectId.is_valid(order_id) else None
        query = {"_id": order_oid} if order_oid else {"orderId": order_id}
        update = {"$set": {"deliveryStatus": data.get("deliveryStatus"), "updatedAt": datetime.now()}}
        result = coll.find_one_and_update(query, update, return_document=True)
        if not result:
            raise HTTPException(status_code=404, detail="Order not found")
        return _serialize(result)
    except Exception as e:
        print(f"Error updating delivery status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating delivery status: {str(e)}")

# Update payment status
async def update_payment_status(order_id: str, data: dict, user=None):
    try:
        coll = db.get_collection("orders")
        order_oid = ObjectId(order_id) if ObjectId.is_valid(order_id) else None
        query = {"_id": order_oid} if order_oid else {"orderId": order_id}
        is_paid = data.get("isPaid", False)
        paid_at = datetime.fromtimestamp(data.get("paidAt") / 1000) if data.get("paidAt") else None
        update = {"$set": {"isPaid": is_paid, "paidAt": paid_at, "updatedAt": datetime.now()}}
        result = coll.find_one_and_update(query, update, return_document=True)
        if not result:
            raise HTTPException(status_code=404, detail="Order not found")
        return _serialize(result)
    except Exception as e:
        print(f"Error updating payment status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating payment status: {str(e)}")

# Delete order
async def delete_order(order_id: str, user=None):
    try:
        coll = db.get_collection("orders")
        order_oid = ObjectId(order_id) if ObjectId.is_valid(order_id) else None
        query = {"_id": order_oid} if order_oid else {"orderId": order_id}
        result = coll.find_one_and_delete(query)
        if not result:
            raise HTTPException(status_code=404, detail="Order not found")
        return {"message": "Order deleted successfully"}
    except Exception as e:
        print(f"Error deleting order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting order: {str(e)}")