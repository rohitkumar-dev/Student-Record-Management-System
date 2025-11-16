import smtplib
import ssl
from email.message import EmailMessage
from .config import settings
from random import randint
from datetime import datetime, timedelta
from .db import otps_collection

def generate_otp() -> str:
    return f"{randint(100000, 999999)}"

def send_email(to_email: str, subject: str, body: str):
    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email

    context = ssl.create_default_context()
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls(context=context)
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)

async def create_and_send_otp(email: str, purpose: str = "registration"):
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    await otps_collection.update_one(
        {"email": email, "purpose": purpose},
        {"$set": {"otp": otp, "expires_at": expires_at}},
        upsert=True
    )
    subject = f"Your {purpose} OTP"
    body = f"Your OTP for {purpose} is: {otp}. It expires in 10 minutes."

    send_email(email, subject, body)
