import json
import base64
from fastapi import FastAPI, WebSocket, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from twilio.twiml.voice_response import VoiceResponse, Connect

from app.services.stt_service import DeepgramService

app = FastAPI(title="SAVIOR - Situational Analysis & Virtual Intelligent Operational Router")

# Configure CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def transcript_callback(transcript: str):
    """Callback function when Deepgram returns a transcript."""
    print(f"Transcript: {transcript}")
    # TODO (Phase 2): Send transcript to Situational Analysis pipeline
    # TODO (Phase 3): Push to React Dashboard via WebSockets

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "online", "project": "SAVIOR Backend"}

@app.post("/twilio/voice")
async def handle_voice_call(request: Request):
    """
    Twilio Webhook: Initial point of contact for an incoming call.
    Tells Twilio to stream the audio to our WebSocket.
    """
    response = VoiceResponse()
    
    # Start the stream immediately
    host = request.url.hostname
    connect = Connect()
    connect.stream(url=f"wss://{host}/ws/twilio")
    response.append(connect)
    
    # Intro message
    response.say("SAVIOR Emergency System is active. Please state your emergency.")
    
    # Keep the TwiML executing so the call doesn't hang up
    # This creates a 5-minute window for the call
    for _ in range(30):
        response.pause(length=10)
    
    return Response(content=str(response), media_type="text/xml")

@app.websocket("/ws/twilio")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket: Receives the live audio stream (Media) from Twilio.
    """
    await websocket.accept()
    print("WebSocket connection established with Twilio.")
    
    # Initialize Deepgram Service
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
                # Extract the base64-encoded audio payload (mulaw, 8000Hz)
                payload = data['media']['payload']
                audio_chunk = base64.b64decode(payload)
                
                # Send the decoded chunk to Deepgram for real-time STT
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
