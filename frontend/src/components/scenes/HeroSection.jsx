import { useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Globe from '../three/Globe';
import ParticleField from '../three/ParticleField';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import './HeroSection.css';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(statsRef.current?.querySelectorAll('.hero-stat'),
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.5)' },
        '-=0.4'
      )
      .fromTo(ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToArchitecture = () => {
    document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero-section" ref={sectionRef}>
      <div className="hero-bg" aria-hidden="true" />

      <div className="hero-canvas" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 1.5]}
          frameloop="always"
        >
          <Suspense fallback={null}>
            <Globe position={[0, 0, 0]} scale={1.3} />
            <ParticleField count={120} spread={10} />
            <ambientLight intensity={0.2} />
          </Suspense>
        </Canvas>
      </div>

      <div className="hero-content">
        <div className="hero-badge mono">B.TECH MAJOR PROJECT 2024-25</div>

        <h1 className="hero-title" ref={titleRef}>
          <span className="title-line">AI-Powered</span>
          <span className="title-line gradient">Emergency Triage</span>
        </h1>

        <p className="hero-subtitle" ref={subtitleRef}>
          From panicked call to precise dispatch in seconds.
          SAVIOR uses real-time AI transcription, NLP analysis, and smart routing
          to transform India's emergency response system.
        </p>

        <div className="hero-stats" ref={statsRef}>
          <div className="hero-stat">
            <span className="stat-number text-gradient">4 min</span>
            <span className="stat-label">Target Response</span>
          </div>
          <div className="hero-stat">
            <span className="stat-number text-gradient">94%</span>
            <span className="stat-label">Routing Accuracy</span>
          </div>
          <div className="hero-stat">
            <span className="stat-number text-gradient">Real-time</span>
            <span className="stat-label">AI Transcription</span>
          </div>
        </div>

        <div className="hero-actions" ref={ctaRef}>
          <button className="btn btn-primary" onClick={scrollToDemo}>
            <span className="btn-dot" aria-hidden="true">●</span>
            SEE IT WORK
          </button>
          <button className="btn btn-secondary" onClick={scrollToArchitecture}>
            VIEW ARCHITECTURE
            <span className="btn-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className="hero-scroll-indicator" aria-hidden="true">
        <div className="scroll-line" />
        <span className="scroll-text mono">SCROLL</span>
      </div>
    </section>
  );
}
