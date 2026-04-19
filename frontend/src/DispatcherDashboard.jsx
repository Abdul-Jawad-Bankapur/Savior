import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet's default icon missing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

// --- IMPORTANT: Update this to your current Ngrok URL ---
const NGROK_URL = "dronish-backdoor-buck.ngrok-free.dev"; 

export default function DispatcherDashboard() {
  const [transcripts, setTranscripts] = useState([]);
  const [locations, setLocations] = useState({});
  const [alerts, setAlerts] = useState([]);
  const ws = useRef(null);

  // Default map center (e.g., Bangalore)
  const defaultCenter = [12.9716, 77.5946];

  useEffect(() => {
    // Connect to the FastAPI Dispatcher WebSocket
    ws.current = new WebSocket(`ws://localhost:8000/ws/dispatcher`);

    ws.current.onopen = () => console.log("Connected to SAVIOR Backend");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'transcript') {
        // Add new transcript to the list
        setTranscripts((prev) => [...prev, { caller_id: data.caller_id, text: data.data }]);
      } 
      else if (data.type === 'location') {
        // Display System Alerts (like Location Denied)
        if (data.system_alert) {
          setAlerts((prev) => [data.system_alert, ...prev].slice(0, 3)); // Keep last 3 alerts
        }
        // Plot on map if coordinates are valid
        if (data.plot_on_map) {
          setLocations((prev) => ({
            ...prev,
            [data.caller_id]: { lat: data.lat, lng: data.lng }
          }));
        }
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* LEFT PANEL: The Map */}
      <div style={{ flex: 2, position: 'relative' }}>
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          
          {/* Loop through received locations and drop pins */}
          {Object.entries(locations).map(([callerId, coords]) => (
            <Marker key={callerId} position={[coords.lat, coords.lng]}>
              <Popup>
                <b>Emergency:</b> {callerId}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* RIGHT PANEL: Live Data Feed */}
      <div style={{ flex: 1, backgroundColor: '#1e1e1e', color: 'white', padding: '20px', overflowY: 'auto' }}>
        <h2>SAVIOR Dashboard</h2>
        <hr style={{ borderColor: '#444' }}/>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
            <strong>System Alerts:</strong>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {alerts.map((alert, i) => <li key={i}>{alert}</li>)}
            </ul>
          </div>
        )}

        {/* Live Transcripts Section */}
        <h3>Live Audio Transcripts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transcripts.map((t, index) => (
            <div key={index} style={{ backgroundColor: '#333', padding: '10px', borderRadius: '5px' }}>
              <span style={{ fontSize: '0.8em', color: '#aaa' }}>Caller: {t.caller_id}</span>
              <p style={{ margin: '5px 0 0 0' }}>{t.text}</p>
            </div>
          ))}
          {transcripts.length === 0 && <p style={{ color: '#888' }}>Waiting for calls...</p>}
        </div>
      </div>

    </div>
  );
}