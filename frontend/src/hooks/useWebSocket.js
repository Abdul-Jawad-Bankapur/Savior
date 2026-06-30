import { useState, useEffect, useRef, useCallback } from 'react';

const MOCK_EMERGENCIES = [
  {
    id: 1,
    type: 'medical',
    severity: 9,
    location: 'Koramangala, Bangalore',
    transcript: 'My father is having chest pain, he can\'t breathe properly...',
    timestamp: '2 min ago',
    coordinates: { lat: 12.9352, lng: 77.6245 },
    status: 'active',
  },
  {
    id: 2,
    type: 'fire',
    severity: 7,
    location: 'Sector 45, Gurugram',
    transcript: 'There\'s smoke coming from the third floor of the apartment building',
    timestamp: '5 min ago',
    coordinates: { lat: 28.4345, lng: 77.0590 },
    status: 'active',
  },
  {
    id: 3,
    type: 'police',
    severity: 6,
    location: 'Andheri West, Mumbai',
    transcript: 'Suspicious activity near the subway station, multiple people involved',
    timestamp: '8 min ago',
    coordinates: { lat: 19.1358, lng: 72.8275 },
    status: 'dispatched',
  },
  {
    id: 4,
    type: 'medical',
    severity: 4,
    location: 'Anna Nagar, Chennai',
    transcript: 'My daughter fell and has a deep cut on her forehead, bleeding heavily',
    timestamp: '12 min ago',
    coordinates: { lat: 13.0850, lng: 80.2101 },
    status: 'resolved',
  },
  {
    id: 5,
    type: 'fire',
    severity: 8,
    location: 'Banjara Hills, Hyderabad',
    transcript: 'Chemical fire at the warehouse, flames are spreading quickly',
    timestamp: '15 min ago',
    coordinates: { lat: 17.4156, lng: 78.4350 },
    status: 'active',
  },
];

export function useWebSocket(url) {
  const [emergencies, setEmergencies] = useState(MOCK_EMERGENCIES);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!url) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('SAVIOR WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.transcript) {
            setLiveTranscript(data.transcript);
          }
          if (data.emergency) {
            setEmergencies(prev => [data.emergency, ...prev]);
          }
        } catch (e) {
          console.warn('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        console.log('SAVIOR WebSocket disconnected');
        setIsConnected(false);
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error, using mock data:', error);
        setIsConnected(false);
      };
    } catch (e) {
      console.warn('WebSocket not available, using mock data');
      setIsConnected(false);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [connect]);

  const sendCommand = useCallback((command) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command));
    }
  }, []);

  return {
    emergencies,
    liveTranscript,
    isConnected,
    sendCommand,
  };
}
