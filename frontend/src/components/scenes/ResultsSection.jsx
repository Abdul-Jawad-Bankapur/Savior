import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import './ResultsSection.css';

gsap.registerPlugin(ScrollTrigger);

const metrics = [
  {
    label: 'Avg Response Time',
    before: '12-15 min',
    after: '2-4 min',
    improvement: '75% faster',
  },
  {
    label: 'Call Routing Accuracy',
    before: '40%',
    after: '94%',
    improvement: '2.3x better',
  },
  {
    label: 'Location Detection',
    before: 'Manual entry',
    after: 'Auto NER',
    improvement: 'Zero manual input',
  },
  {
    label: 'Severity Assessment',
    before: 'Operator judgment',
    after: 'AI-scored 1-10',
    improvement: 'Consistent scoring',
  },
];

const techStack = [
  { category: 'Backend', items: ['Python 3.11', 'FastAPI', 'uvicorn', 'WebSockets'] },
  { category: 'AI / ML', items: ['Deepgram Nova-2', 'NLP Pipeline', 'NER', 'Classification'] },
  { category: 'Telephony', items: ['Twilio API', 'WebRTC', 'mu-law Audio'] },
  { category: 'Frontend', items: ['React 19', 'Three.js', 'GSAP', 'Vite'] },
];

export default function ResultsSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 80%', once: true },
        }
      );

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%', once: true },
            delay: i * 0.08,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="results" className="results-section" ref={sectionRef}>
      <div className="results-header" ref={headerRef}>
        <h2 className="results-title">Impact & Results</h2>
        <p className="results-subtitle mono">BEFORE vs AFTER SAVIOR</p>
      </div>

      <div className="results-grid">
        {metrics.map((m, i) => (
          <div key={m.label} className="result-card" ref={el => cardRefs.current[i] = el}>
            <h3 className="result-label">{m.label}</h3>
            <div className="result-comparison">
              <div className="result-before">
                <span className="comparison-label">Before</span>
                <span className="comparison-value before">{m.before}</span>
              </div>
              <div className="result-arrow" aria-hidden="true">→</div>
              <div className="result-after">
                <span className="comparison-label">With SAVIOR</span>
                <span className="comparison-value after">{m.after}</span>
              </div>
            </div>
            <div className="result-improvement mono">{m.improvement}</div>
          </div>
        ))}
      </div>

      <div className="tech-stack">
        <h3 className="stack-title mono">TECHNOLOGY STACK</h3>
        <div className="stack-grid">
          {techStack.map((cat, i) => (
            <div key={cat.category} className="stack-category">
              <span className="category-label mono">{cat.category}</span>
              <div className="category-items">
                {cat.items.map((item, j) => (
                  <span key={j} className="stack-badge mono">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
