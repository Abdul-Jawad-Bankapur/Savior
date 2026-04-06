import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import './HowItWorksSection.css';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    title: 'Call Received',
    desc: 'User dials emergency number. Twilio webhook triggers and streams raw mu-law audio to FastAPI via WebSocket.',
    tech: ['Twilio Voice API', 'Webhook endpoint', 'Base64 audio chunks', '8kHz sample rate'],
  },
  {
    number: '02',
    title: 'Real-Time Transcription',
    desc: 'Audio forwarded to Deepgram Nova-2. Returns live transcript with Indian English recognition and smart formatting.',
    tech: ['Deepgram Nova-2', 'en-IN model', 'Interim + final results', 'Smart format'],
  },
  {
    number: '03',
    title: 'AI Analysis',
    desc: 'NLP pipeline classifies emergency type, extracts location via NER, and assigns severity score 1-10.',
    tech: ['Type classification', 'NER for addresses', 'Severity scoring', 'Keyword extraction'],
  },
  {
    number: '04',
    title: 'Smart Dispatch',
    desc: 'Analysis merged with companion app GPS + medical data. Complete package pushed to dashboard via WebSocket.',
    tech: ['GPS merge', 'Medical profile lookup', 'WebSocket push', 'Auto-routing'],
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const stepRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 80%', once: true },
        }
      );

      stepRefs.current.forEach((step, i) => {
        if (!step) return;
        gsap.fromTo(step,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 85%', once: true },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" className="hiw-section" ref={sectionRef}>
      <div className="hiw-header" ref={headerRef}>
        <h2 className="hiw-title">How It Works</h2>
        <p className="hiw-subtitle mono">CALL TO DISPATCH PIPELINE</p>
      </div>

      <div className="hiw-steps">
        {steps.map((step, i) => (
          <div key={step.number} className="hiw-step" ref={el => stepRefs.current[i] = el}>
            <div className="step-number mono" style={{ '--step-color': ['var(--accent-red)', 'var(--accent-amber)', 'var(--accent-blue)', 'var(--accent-green)'][i] }}>
              {step.number}
            </div>
            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              <div className="step-tech">
                {step.tech.map((t, j) => (
                  <span key={j} className="tech-tag mono">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
