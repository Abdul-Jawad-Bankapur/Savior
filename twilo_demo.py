import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv()

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
client = Client(account_sid, auth_token)

# 1. REPLACE WITH YOUR NGROK URL (e.g., https://abc-123.ngrok-free.app)
# Note: Ensure NO trailing slash in the string or use .rstrip("/")
PUBLIC_URL = "https://threatenedly-unpredicative-louis.ngrok-free.dev".rstrip("/")

# 2. REPLACE WITH YOUR ACTUAL PHONE NUMBER (Verified in Twilio Console)
TO_NUMBER = "+918970732147"

# 3. YOUR TWILIO PHONE NUMBER
FROM_NUMBER = "+18703616008" 

call = client.calls.create(
    from_=FROM_NUMBER,
    to=TO_NUMBER,
    # Point Twilio to our FastAPI endpoint
    url=f"{PUBLIC_URL}/twilio/voice",
)

print(f"Call initiated! SID: {call.sid}")
