import os
import asyncio
import json
import websockets
from dotenv import load_dotenv

load_dotenv()

class DeepgramService:
    def __init__(self, transcript_callback):
        self.api_key = os.getenv("DEEPGRAM_API_KEY")
        self.callback = transcript_callback
        self.ws = None
        self.url = (
            "wss://api.deepgram.com/v1/listen"
            "?model=nova-2"
            "&language=en-IN"
            "&smart_format=true"
            "&encoding=mulaw"
            "&sample_rate=8000"
            "&interim_results=true"
        )

    async def start(self):
        """Starts the Deepgram connection via direct WebSockets."""
        try:
            headers = {
                "Authorization": f"Token {self.api_key}"
            }
            
            self.ws = await websockets.connect(
                self.url,
                additional_headers=headers
            )
            
            asyncio.create_task(self._listen())
            print("Deepgram Direct WebSocket connected successfully.")
            return True
        except Exception as e:
            print(f"Failed to connect to Deepgram: {e}")
            return False

    async def _listen(self):
        """Internal task to listen for messages from Deepgram."""
        try:
            async for message in self.ws:
                data = json.loads(message)
                if "channel" in data:
                    alternatives = data["channel"].get("alternatives", [])
                    if alternatives:
                        transcript = alternatives[0].get("transcript", "")
                        if transcript:
                            self.callback(transcript)
                            
        except Exception as e:
            print(f"Deepgram listener stopped: {e}")

    def send_audio(self, audio_data):
        """Sends raw audio bytes to Deepgram."""
        if self.ws:
            try:
                # We use create_task because this is called from a sync context
                # in the main loop but websockets.send is async.
                asyncio.create_task(self.ws.send(audio_data))
            except Exception:
                # Silently fail if connection is closing
                pass

    def stop(self):
        """Closes the Deepgram connection."""
        if self.ws:
            try:
                # Try to send close message and close
                asyncio.create_task(self._safe_close())
                print("Deepgram connection stop initiated.")
            except Exception as e:
                print(f"Error while stopping Deepgram: {e}")

    async def _safe_close(self):
        """Helper to close the websocket safely."""
        try:
            await self.ws.send(json.dumps({"type": "CloseStream"}))
            await self.ws.close()
        except Exception:
            pass
