from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import os

# Configure email settings
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("EMAIL_USER"),
    MAIL_PASSWORD=os.getenv("EMAIL_PASSWORD"),
    MAIL_FROM=os.getenv("EMAIL_FROM", os.getenv("EMAIL_USER")),
    MAIL_PORT=int(os.getenv("EMAIL_PORT")),
    MAIL_SERVER=os.getenv("EMAIL_HOST"),
    MAIL_TLS=os.getenv("EMAIL_SECURE") == "true",
    MAIL_SSL=not (os.getenv("EMAIL_SECURE") == "true"),
)

fast_mail = FastMail(conf)

# Send order confirmation email to customer
async def send_order_confirmation_email(order):
    subject = f"Order Confirmation - {order['orderId']}"
    recipients = [order['contactDetails']['email']]
    body = f"""
    <h1>Order Confirmation</h1>
    <p>Thank you for your order, {order['contactDetails']['firstName']}!</p>
    <p>Order ID: {order['orderId']}</p>
    <p>Total: £{order['totalPrice']}</p>
    """
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype="html"
    )
    await fast_mail.send_message(message)

# Send order notification email to admin
async def send_order_notification_to_admin(order):
    subject = f"New Order Received - {order['orderId']}"
    recipients = [os.getenv("ADMIN_EMAIL")]
    body = f"""
    <h1>New Order Received</h1>
    <p>Order ID: {order['orderId']}</p>
    <p>Customer: {order['contactDetails']['firstName']} {order['contactDetails']['lastName']}</p>
    <p>Total: £{order['totalPrice']}</p>
    """
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype="html"
    )
    await fast_mail.send_message(message)

# Send order status update email to customer
async def send_order_status_update_email(order, new_status):
    subject = f"Order Status Update - {order['orderId']}"
    recipients = [order['contactDetails']['email']]
    body = f"""
    <h1>Order Status Update</h1>
    <p>Your order status has been updated to: {new_status}</p>
    <p>Order ID: {order['orderId']}</p>
    <p>Total: £{order['totalPrice']}</p>
    """
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype="html"
    )
    await fast_mail.send_message(message)
