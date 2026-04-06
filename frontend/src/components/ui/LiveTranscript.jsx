import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import './LiveTranscript.css';

export default function LiveTranscript({ text = '', isConnected = false }) {
  const containerRef = useRef(null);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!text) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayText]);

  return (
    <div className="live-transcript-panel" ref={containerRef}>
      <div className="transcript-header">
        <span className="transcript-title mono">LIVE TRANSCRIPT</span>
        <span className={`transcript-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● LIVE' : '○ MOCK'}
        </span>
      </div>
      <div className="transcript-content mono">
        {displayText ? (
          <>
            <span className="transcript-text">{displayText}</span>
            <span className="cursor-blink">▌</span>
          </>
        ) : (
          <span className="transcript-placeholder">Waiting for incoming call...</span>
        )}
      </div>
      <div className="transcript-footer mono">
        <span>DEEPGRAM NOVA-2</span>
        <span>en-IN | 8kHz μ-law</span>
      </div>
    </div>
  );
}
