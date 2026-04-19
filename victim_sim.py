import asyncio
import websockets
import json

async def send_location():
    # Use localhost to bypass Ngrok security for testing
    uri = "ws://localhost:8000/ws/location/+919113896575"
    
    try:
        async with websockets.connect(uri) as websocket:
            # We send raw lat/lng; the BACKEND main.py wraps this in the 'location' type
            location_data = {
                "lat": 12.9716,
                "lng": 77.5946
            }
            await websocket.send(json.dumps(location_data))
            print("Location sent! Check the React Map now.")
            
            # Keep connection open for 2 seconds so React has time to process
            await asyncio.sleep(2) 
            
    except Exception as e:
        print(f"Failed to send location: {e}")

if __name__ == "__main__":
    asyncio.run(send_location())