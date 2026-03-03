import json
import base64
from fastapi import FastAPI, WebSocket, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from twilio.twiml.voice_response import VoiceResponse, Connect

app = FastAPI(title="SAVIOR - Situational Analysis & Virtual Intelligent Operational Router")

# Configure CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
    # <Connect> tells Twilio to start streaming audio to our WebSocket
    # The 'url' must be your public server's WebSocket address (e.g., wss://your-domain.com/ws/twilio)
    connect = Connect()
    connect.stream(url=f"wss://{request.url.hostname}/ws/twilio")
    response.append(connect)
    
    # Stay on the line (placeholder while the stream is active)
    response.say("SAVIOR Emergency System is monitoring this call.")
    response.pause(length=10) # Adjust as needed for long calls
    
    return Response(content=str(response), media_type="text/xml")

@app.websocket("/ws/twilio")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket: Receives the live audio stream (Media) from Twilio.
    """
    await websocket.accept()
    print("WebSocket connection established with Twilio.")
    
    try:
        while True:
            # Twilio sends data in JSON chunks over the WebSocket
            # Format: {'event': 'media', 'media': {'payload': 'base64_encoded_audio', ...}, ...}
            message = await websocket.receive_text()
            data = json.loads(message)
            
            if data['event'] == 'start':
                print(f"Stream starting: {data['start']['streamSid']}")
            
            elif data['event'] == 'media':
                # Extract the base64-encoded audio payload
                payload = data['media']['payload']
                audio_chunk = base64.b64decode(payload)
                
                # TODO (Phase 1): Pass audio_chunk to Deepgram STT
                # print(f"Received audio chunk: {len(audio_chunk)} bytes")
                
            elif data['event'] == 'stop':
                print("Twilio stream stopped.")
                break
                
    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
