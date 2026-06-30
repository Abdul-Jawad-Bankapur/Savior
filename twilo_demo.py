import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")

PUBLIC_URL = os.getenv("NGROK_URL", "http://localhost:8000").rstrip("/")
TO_NUMBER = os.getenv("TO_NUMBER")
FROM_NUMBER = os.getenv("FROM_NUMBER")

if not all([account_sid, auth_token, TO_NUMBER, FROM_NUMBER]):
    print("Error: Missing required environment variables.")
    print("Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TO_NUMBER, FROM_NUMBER in .env")
    exit(1)

client = Client(account_sid, auth_token)

call = client.calls.create(
    from_=FROM_NUMBER,
    to=TO_NUMBER,
    url=f"{PUBLIC_URL}/twilio/voice",
)

print(f"Call initiated! SID: {call.sid}")
