import json
import base64
import asyncio
from fastapi import FastAPI, WebSocket, Request, Response, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from twilio.twiml.voice_response import VoiceResponse, Connect

from app.services.stt_service import DeepgramService

app = FastAPI(title="SAVIOR - Situational Analysis & Virtual Intelligent Operational Router")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NEW: Connection Manager for the React Dashboard ---
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
        # NEW: Phase 3 Implemented! Push transcript to React Dashboard
        payload = {
            "type": "transcript",
            "data": transcript
        }
        await manager.broadcast_to_dispatchers(payload)

@app.get("/")
async def root():
    return {"status": "online", "project": "SAVIOR Backend"}

# --- NEW: WebSocket Route for React Dispatcher Dashboard ---
@app.websocket("/ws/dispatcher")
async def dispatcher_endpoint(websocket: WebSocket):
    """
    WebSocket: The React frontend connects here to receive live transcripts and map locations.
    """
    await manager.connect_dispatcher(websocket)
    print("Dispatcher Dashboard Connected.")
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_dispatcher(websocket)
        print("Dispatcher Dashboard Disconnected.")
# -----------------------------------------------------------

# --- NEW: WebSocket Route for Caller Location (Soft Gate Logic) ---
@app.websocket("/ws/location/{caller_id}")
async def location_endpoint(websocket: WebSocket, caller_id: str):
    """
    WebSocket: The victim's web/mobile app connects here to send GPS coordinates.
    """
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
            
            # Forward the location data to the React Dashboard
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