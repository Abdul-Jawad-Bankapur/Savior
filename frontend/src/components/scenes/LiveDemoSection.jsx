import { useRef, useEffect, useState, useCallback } from 'react';
import EmergencyCard from '../ui/EmergencyCard';
import LiveTranscript from '../ui/LiveTranscript';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import './LiveDemoSection.css';

gsap.registerPlugin(ScrollTrigger);

const INITIAL_EMERGENCIES = [
  { id: 1, type: 'medical', severity: 9, location: 'Koramangala, Bangalore', transcript: 'My father collapsed, he\'s not breathing...', timestamp: 'Just now', coordinates: { lat: 12.9352, lng: 77.6245 }, status: 'active' },
  { id: 2, type: 'fire', severity: 7, location: 'Sector 45, Gurugram', transcript: 'Smoke coming from the third floor...', timestamp: '2 min ago', coordinates: { lat: 28.4345, lng: 77.0590 }, status: 'dispatched' },
  { id: 3, type: 'police', severity: 6, location: 'Andheri West, Mumbai', transcript: 'Break-in at commercial complex...', timestamp: '5 min ago', coordinates: { lat: 19.1358, lng: 72.8275 }, status: 'active' },
  { id: 4, type: 'medical', severity: 8, location: 'Anna Nagar, Chennai', transcript: 'Severe allergic reaction, swelling...', timestamp: '8 min ago', coordinates: { lat: 13.0850, lng: 80.2101 }, status: 'dispatched' },
];

const NEW_CALLS = [
  { type: 'medical', severity: 5, location: 'Indiranagar, Bangalore', transcript: 'My daughter fell from the stairs, her ankle is swollen...', coordinates: { lat: 12.9716, lng: 77.6412 } },
  { type: 'fire', severity: 8, location: 'Connaught Place, Delhi', transcript: 'Electrical fire in the basement, flames spreading fast...', coordinates: { lat: 28.6304, lng: 77.2177 } },
  { type: 'police', severity: 4, location: 'Bandra East, Mumbai', transcript: 'Suspicious package left outside the mall entrance...', coordinates: { lat: 19.0596, lng: 72.8457 } },
  { type: 'medical', severity: 7, location: 'Jubilee Hills, Hyderabad', transcript: 'Elderly person having a seizure, need ambulance urgently...', coordinates: { lat: 17.4239, lng: 78.4738 } },
  { type: 'fire', severity: 6, location: 'Salt Lake, Kolkata', transcript: 'Kitchen fire in apartment 4B, smoke everywhere...', coordinates: { lat: 22.5744, lng: 88.4312 } },
];

export default function LiveDemoSection({ liveTranscript = '', isConnected = false }) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const [emergencies, setEmergencies] = useState(INITIAL_EMERGENCIES);
  const [totalCalls, setTotalCalls] = useState(4);
  const [callIndex, setCallIndex] = useState(0);

  const handleDispatch = useCallback((id) => {
    setEmergencies(prev =>
      prev.map(e => e.id === id ? { ...e, status: 'dispatched' } : e)
    );
  }, []);

  const handleResolve = useCallback((id) => {
    setEmergencies(prev =>
      prev.map(e => e.id === id ? { ...e, status: 'resolved' } : e)
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCall = NEW_CALLS[callIndex % NEW_CALLS.length];
      const newEmergency = {
        ...newCall,
        id: Date.now(),
        timestamp: 'Just now',
        status: 'active',
      };
      setEmergencies(prev => [newEmergency, ...prev.slice(0, 4)]);
      setTotalCalls(prev => prev + 1);
      setCallIndex(prev => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, [callIndex]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 80%', once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const activeCount = emergencies.filter(e => e.status === 'active').length;
  const dispatchedCount = emergencies.filter(e => e.status === 'dispatched').length;
  const resolvedCount = emergencies.filter(e => e.status === 'resolved').length;

  return (
    <section id="demo" className="live-demo-section" ref={sectionRef}>
      <div className="demo-header" ref={headerRef}>
        <div className="demo-live-badge mono">
          <span className="live-dot" aria-hidden="true">●</span>
          LIVE DEMO
        </div>
        <h2 className="demo-title">Dispatch Command Center</h2>
        <p className="demo-subtitle mono">REAL-TIME EMERGENCY TRIAGE SYSTEM</p>
      </div>

      <div className="demo-stats">
        <div className="demo-stat">
          <span className="demo-stat-value mono">{totalCalls}</span>
          <span className="demo-stat-label">TOTAL CALLS</span>
        </div>
        <div className="demo-stat stat-active">
          <span className="demo-stat-value mono">{activeCount}</span>
          <span className="demo-stat-label">ACTIVE</span>
        </div>
        <div className="demo-stat stat-dispatched">
          <span className="demo-stat-value mono">{dispatchedCount}</span>
          <span className="demo-stat-label">DISPATCHED</span>
        </div>
        <div className="demo-stat stat-resolved">
          <span className="demo-stat-value mono">{resolvedCount}</span>
          <span className="demo-stat-label">RESOLVED</span>
        </div>
        <div className="demo-stat">
          <span className="demo-stat-value mono">2.4m</span>
          <span className="demo-stat-label">AVG RESPONSE</span>
        </div>
      </div>

      <div className="demo-grid">
        <div className="demo-cards">
          {emergencies.map((emergency, i) => (
            <div key={emergency.id} className="demo-card-wrapper">
              <EmergencyCard
                emergency={emergency}
                index={i}
                onDispatch={handleDispatch}
                onResolve={handleResolve}
              />
            </div>
          ))}
          <div className="demo-next-call mono">
            Next call in ~{12 - (Date.now() % 12000 / 1000).toFixed(0)}s...
          </div>
        </div>

        <div className="demo-sidebar">
          <LiveTranscript text={liveTranscript} isConnected={isConnected} />

          <div className="demo-system-panel">
            <h3 className="panel-title mono">SYSTEM STATUS</h3>
            <div className="panel-row">
              <span className="panel-label">STT Engine</span>
              <span className="panel-status status-online">Online</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Deepgram Model</span>
              <span className="panel-value mono">nova-2</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Language</span>
              <span className="panel-value mono">en-IN</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Audio Format</span>
              <span className="panel-value mono">8kHz μ-law</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Connection</span>
              <span className={`panel-status ${isConnected ? 'status-online' : 'status-mock'}`}>
                {isConnected ? 'WebSocket' : 'Mock Mode'}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Backend</span>
              <span className="panel-value mono">FastAPI :8000</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
