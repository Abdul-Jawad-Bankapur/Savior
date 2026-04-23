import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet's default icon missing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

// --- The Auto-Center Camera Component ---
function MapAutoFly({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      map.flyTo([coords.lat, coords.lng], 16, { animate: true, duration: 2.5 }); 
    }
  }, [coords, map]);
  return null;
}
// ----------------------------------------

export default function DispatcherDashboard() {
  const [transcripts, setTranscripts] = useState([]);
  const [locations, setLocations] = useState({});
  const [alerts, setAlerts] = useState([]);
  const ws = useRef(null);

  const defaultCenter = [15.3647, 75.1239]; // Defaulted to Hubballi center

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/dispatcher`);
    ws.current.onopen = () => console.log("Connected to SAVIOR Backend");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'transcript') {
        setTranscripts((prev) => [...prev, { caller_id: data.caller_id, text: data.data }]);
      } 
      else if (data.type === 'location') {
        if (data.system_alert) {
          setAlerts((prev) => [data.system_alert, ...prev].slice(0, 3));
        }
        
        if (data.plot_on_map) {
          // 1. Immediately drop the pin
          setLocations((prev) => ({
            ...prev,
            [data.caller_id]: { lat: data.lat, lng: data.lng, address: "Fetching precise address..." }
          }));

          // 2. REVERSE GEOCODING (The final pro touch)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}`)
            .then(res => res.json())
            .then(addressData => {
              setLocations((prev) => ({
                ...prev,
                [data.caller_id]: { 
                  lat: data.lat, 
                  lng: data.lng, 
                  address: addressData.display_name 
                }
              }));
            })
            .catch(err => {
              console.error("Geocoding failed:", err);
              setLocations((prev) => ({
                ...prev,
                [data.caller_id]: { lat: data.lat, lng: data.lng, address: "GPS Locked. Address lookup failed." }
              }));
            });
        }
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const activeCallers = Object.values(locations);
  const latestCoords = activeCallers.length > 0 ? activeCallers[activeCallers.length - 1] : null;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121212', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* LEFT PANEL: The Map */}
      <div style={{ flex: 2, position: 'relative', borderRight: '2px solid #333' }}>
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          {/* UPDATED: CartoDB Dark Matter (No API Key Required) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {Object.entries(locations).map(([callerId, coords]) => (
            <Marker key={callerId} position={[coords.lat, coords.lng]}>
              <Popup>
                <div style={{ minWidth: '200px', color: '#333' }}>
                  <b style={{ color: '#ef4444', fontSize: '14px' }}>🚨 Emergency:</b> {callerId} <br/>
                  <hr style={{ margin: '8px 0', borderColor: '#ccc' }}/>
                  <b>Location:</b> <br/>
                  <span style={{ fontSize: '13px' }}>{coords.address}</span>
                </div>
              </Popup>
            </Marker>
          ))}

          <MapAutoFly coords={latestCoords} />
        </MapContainer>
      </div>

      {/* RIGHT PANEL: Live Data Feed */}
      <div style={{ flex: 1, backgroundColor: '#1e1e1e', padding: '20px', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>SAVIOR - Dispatch Center</h2>
        <p style={{ fontSize: '0.8em', color: '#888', marginBottom: '20px' }}>Real-time Situational Analysis v1.0</p>
        <hr style={{ borderColor: '#444' }}/>

        {alerts.length > 0 && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
            <strong>System Alerts:</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
              {alerts.map((alert, i) => <li key={i}>{alert}</li>)}
            </ul>
          </div>
        )}

        <h3>Live Audio Transcripts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transcripts.map((t, index) => (
            <div key={index} style={{ backgroundColor: '#2d2d2d', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #60a5fa' }}>
              <span style={{ fontSize: '0.75em', color: '#9ca3af', fontWeight: 'bold' }}>CALLER ID: {t.caller_id}</span>
              <p style={{ margin: '8px 0 0 0', lineHeight: '1.4', color: '#e5e7eb' }}>{t.text}</p>
            </div>
          ))}
          {transcripts.length === 0 && <p style={{ color: '#555', fontStyle: 'italic' }}>Monitoring active lines...</p>}
        </div>
      </div>

    </div>
  );
}