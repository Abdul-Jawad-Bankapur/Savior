import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import './ArchitectureSection.css';

gsap.registerPlugin(ScrollTrigger);

const layers = [
  {
    label: 'Twilio Voice API',
    desc: 'Inbound call webhook → audio stream',
    tech: 'Webhook · WebSocket · μ-law 8kHz',
    color: '#f22f46',
  },
  {
    label: 'FastAPI Backend',
    desc: 'Async WebSocket relay + audio routing',
    tech: 'Python 3.11 · asyncio · uvicorn',
    color: '#009688',
  },
  {
    label: 'Deepgram STT',
    desc: 'Nova-2 model → live transcript',
    tech: 'en-IN · Smart Format · Interim results',
    color: '#7c3aed',
  },
  {
    label: 'NLP Pipeline',
    desc: 'Classification + NER + severity scoring',
    tech: 'Type · Location · Severity 1-10',
    color: '#2196f3',
  },
  {
    label: 'WebSocket Push',
    desc: 'Merge GPS + medical → dashboard',
    tech: 'Real-time JSON · Auto-routing',
    color: '#ff9f1c',
  },
  {
    label: 'React Dashboard',
    desc: 'Dispatcher command center',
    tech: 'React 19 · Three.js · GSAP',
    color: '#00e676',
  },
];

export default function ArchitectureSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const layerRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 80%', once: true },
        }
      );

      layerRefs.current.forEach((layer, i) => {
        if (!layer) return;
        gsap.fromTo(layer,
          { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
          {
            opacity: 1, x: 0, duration: 0.5, ease: 'power3.out',
            scrollTrigger: { trigger: layer, start: 'top 85%', once: true },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="architecture" className="arch-section" ref={sectionRef}>
      <div className="arch-header" ref={headerRef}>
        <h2 className="arch-title">System Architecture</h2>
        <p className="arch-subtitle mono">END-TO-END DATA PIPELINE</p>
      </div>

      <div className="arch-pipeline">
        {layers.map((layer, i) => (
          <div key={i} className="arch-flow" ref={el => layerRefs.current[i] = el}>
            <div className="arch-node" style={{ '--node-color': layer.color }}>
              <div className="node-header">
                <span className="node-step mono">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="node-label">{layer.label}</h3>
              </div>
              <p className="node-desc">{layer.desc}</p>
              <div className="node-tech mono">{layer.tech}</div>
            </div>
            {i < layers.length - 1 && (
              <div className="arch-connector" style={{ '--conn-color': layer.color }}>
                <div className="conn-line" />
                <div className="conn-arrow">▼</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
