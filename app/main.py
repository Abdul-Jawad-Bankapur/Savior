import json
import base64
import asyncio
import os
from fastapi import FastAPI, WebSocket, Request, Response, WebSocketDisconnect
from fastapi.responses import HTMLResponse 
from fastapi.middleware.cors import CORSMiddleware
from twilio.twiml.voice_response import VoiceResponse, Connect
from twilio.rest import Client 
from dotenv import load_dotenv 

from app.services.stt_service import DeepgramService

# Load environment variables
load_dotenv()

app = FastAPI(title="SAVIOR - Situational Analysis & Virtual Intelligent Operational Router")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Connection Manager for the React Dashboard ---
class ConnectionManager:
    def __init__(self):
        self.dispatcher_connections: list[WebSocket] = []

    async def connect_dispatcher(self, websocket: WebSocket):
        await websocket.accept()
        self.dispatcher_connections.append(websocket)

    def disconnect_dispatcher(self, websocket: WebSocket):
        self.dispatcher_connections.remove(websocket)

    async def broadcast_to_dispatchers(self, message: dict):
        for connection in self.dispatcher_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Failed to send to a dispatcher: {e}")

manager = ConnectionManager()
# -------------------------------------------------------

async def transcript_callback(transcript: str):
    """Callback function when Deepgram returns a transcript."""
    if transcript.strip():
        print(f"Transcript: {transcript}")
        # Phase 3 Implemented! Push transcript to React Dashboard
        payload = {
            "type": "transcript",
            "data": transcript
        }
        await manager.broadcast_to_dispatchers(payload)

@app.get("/")
async def root():
    return {"status": "online", "project": "SAVIOR Backend"}

# --- Serve the Locator HTML Page ---
@app.get("/locate")
async def serve_locator_page():
    """Serves the SOS HTML page to the victim's phone."""
    try:
        # Assumes locate.html is in the root Savior folder
        with open("locate.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content)
    except FileNotFoundError:
        return HTMLResponse(content="Locator file not found. Ensure locate.html is in the main folder.", status_code=404)
# ----------------------------------------

# --- WebSocket Route for React Dispatcher Dashboard ---
@app.websocket("/ws/dispatcher")
async def dispatcher_endpoint(websocket: WebSocket):
    """WebSocket: The React frontend connects here to receive live transcripts and map locations."""
    await manager.connect_dispatcher(websocket)
    print("Dispatcher Dashboard Connected.")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_dispatcher(websocket)
        print("Dispatcher Dashboard Disconnected.")
# -----------------------------------------------------------

# --- WebSocket Route for Caller Location ---
@app.websocket("/ws/location/{caller_id}")
async def location_endpoint(websocket: WebSocket, caller_id: str):
    """WebSocket: The victim's web/mobile app connects here to send GPS coordinates."""
    await websocket.accept()
    print(f"Location tracking started for caller: {caller_id}")
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            lat = payload.get("lat")
            lng = payload.get("lng")
            
            if lat is not None and lng is not None:
                system_alert = "Location tracked automatically."
                plot_on_map = True
            else:
                system_alert = "WARNING: Location Access Denied/Failed. Ask victim for address immediately."
                plot_on_map = False
            
            dispatcher_payload = {
                "type": "location",
                "caller_id": caller_id,
                "lat": lat,
                "lng": lng,
                "plot_on_map": plot_on_map,
                "system_alert": system_alert
            }
            await manager.broadcast_to_dispatchers(dispatcher_payload)
            
    except WebSocketDisconnect:
        print(f"Location tracking stopped for caller: {caller_id}")
# ------------------------------------------------------------------

@app.post("/twilio/voice")
async def handle_voice_call(request: Request):
    """Twilio Webhook: Initial point of contact for an incoming call."""
    
    # --- SMART SMS TRIGGER ---
    form_data = await request.form()
    direction = form_data.get("Direction", "inbound")
    
    # Detect who the actual victim is based on how the call was started
    if direction == "outbound-api":
        caller_number = form_data.get("To") # If using twilio_demo.py
    else:
        caller_number = form_data.get("From") # If a real phone dials Twilio

    if caller_number:
        try:
            ngrok_url = os.getenv("NGROK_URL")
            account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            twilio_number = os.getenv("FROM_NUMBER")
            
            # Ensure we don't crash if variables are missing
            if all([account_sid, auth_token, twilio_number, ngrok_url]):
                client = Client(account_sid, auth_token)
                sms_body = f"🚨 SAVIOR Emergency Services: Click here to share your exact location with dispatch: {ngrok_url}/locate"
                
                message = client.messages.create(
                    body=sms_body,
                    from_=twilio_number,
                    to=caller_number
                )
                print(f"✅ SMS sent successfully to {caller_number}!")
            else:
                print("⚠️ Missing Twilio credentials or Ngrok URL in .env file.")
        except Exception as e:
            print(f"❌ Failed to send SMS: {e}")
    # ----------------------------------

    # --- Existing TwiML Logic ---
    response = VoiceResponse()
    host = request.url.hostname
    connect = Connect()
    connect.stream(url=f"wss://{host}/ws/twilio")
    response.append(connect)
    
    response.say("SAVIOR Emergency System is active. Please state your emergency.")
    
    for _ in range(30):
        response.pause(length=10)
    
    return Response(content=str(response), media_type="text/xml")

@app.websocket("/ws/twilio")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket: Receives the live audio stream (Media) from Twilio."""
    await websocket.accept()
    print("WebSocket connection established with Twilio.")
    
    dg_service = DeepgramService(transcript_callback)
    if not await dg_service.start():
        await websocket.close()
        return

    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            
            if data['event'] == 'start':
                print(f"Stream starting: {data['start']['streamSid']}")
            
            elif data['event'] == 'media':
                payload = data['media']['payload']
                audio_chunk = base64.b64decode(payload)
                dg_service.send_audio(audio_chunk)
                
            elif data['event'] == 'stop':
                print("Twilio stream stopped.")
                break
                
    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        dg_service.stop()
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)