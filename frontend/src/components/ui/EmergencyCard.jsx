import { useState } from 'react';
import './EmergencyCard.css';

const typeConfig = {
  medical: { color: '#ff3b3b', icon: '✚', label: 'MEDICAL', glow: 'rgba(255, 59, 59, 0.3)' },
  fire: { color: '#ff9f1c', icon: '🔥', label: 'FIRE', glow: 'rgba(255, 159, 28, 0.3)' },
  police: { color: '#2196f3', icon: '🛡', label: 'POLICE', glow: 'rgba(33, 150, 243, 0.3)' },
};

export default function EmergencyCard({ emergency, index, onDispatch, onResolve }) {
  const [status, setStatus] = useState(emergency.status);
  const config = typeConfig[emergency.type] || typeConfig.medical;

  const handleDispatch = () => {
    setStatus('dispatched');
    onDispatch?.(emergency.id);
  };

  const handleResolve = () => {
    setStatus('resolved');
    onResolve?.(emergency.id);
  };

  return (
    <div
      className={`emergency-card status-${status}`}
      style={{ '--card-color': config.color, '--card-glow': config.glow }}
      data-index={index}
      role="article"
      aria-label={`${config.label} emergency - Severity ${emergency.severity}`}
    >
      <div className="card-header">
        <div className="card-type" style={{ color: config.color }}>
          <span className="type-icon">{config.icon}</span>
          <span className="type-label">{config.label}</span>
        </div>
        <div className="card-meta">
          <span className="card-time mono">{emergency.timestamp}</span>
          <span className={`card-badge badge-${status}`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="card-severity">
        <div className="severity-label">
          <span>SEVERITY</span>
          <span className="severity-value mono" style={{ color: config.color }}>
            {emergency.severity}/10
          </span>
        </div>
        <div className="severity-bar-bg">
          <div
            className="severity-bar-fill"
            style={{
              width: `${emergency.severity * 10}%`,
              background: `linear-gradient(90deg, ${config.color}88, ${config.color})`,
              boxShadow: `0 0 12px ${config.glow}`,
            }}
          />
        </div>
      </div>

      <div className="card-location mono">
        <span className="location-icon">◉</span>
        {emergency.location}
      </div>

      <div className="card-transcript">
        <span className="transcript-prefix mono">"</span>
        {emergency.transcript}
      </div>

      <div className="card-coordinates mono">
        {emergency.coordinates.lat.toFixed(4)}°N, {emergency.coordinates.lng.toFixed(4)}°E
      </div>

      <div className="card-actions">
        <button
          className="action-btn action-dispatch"
          onClick={handleDispatch}
          disabled={status !== 'active'}
        >
          {status === 'active' ? 'Dispatch Unit' : status === 'dispatched' ? 'Unit En Route' : 'Dispatched'}
        </button>
        <button
          className="action-btn action-resolve"
          onClick={handleResolve}
          disabled={status === 'resolved'}
        >
          {status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
        </button>
      </div>
    </div>
  );
}
