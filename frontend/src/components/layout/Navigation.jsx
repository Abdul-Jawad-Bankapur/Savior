import { useState, useEffect } from 'react';
import './Navigation.css';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ['hero', 'demo', 'architecture', 'how-it-works', 'results', 'team'];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 300) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'demo', label: 'Live Demo' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'results', label: 'Results' },
    { id: 'team', label: 'Team' },
  ];

  return (
    <nav className={`navigation ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="nav-brand" onClick={() => scrollTo('hero')}>
        <span className="nav-logo">◆</span>
        <span className="nav-title">SAVIOR</span>
      </div>

      <div className="nav-links">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => scrollTo(item.id)}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="nav-status">
        <span className={`status-dot ${scrolled ? 'online' : ''}`} />
        <span className="status-text">SYSTEM ONLINE</span>
      </div>
    </nav>
  );
}
