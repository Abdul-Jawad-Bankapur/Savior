import './TeamFooter.css';

export default function TeamFooter() {
  return (
    <footer id="team" className="team-footer">
      <div className="footer-content">
        <div className="footer-team">
          <h3 className="team-title">The Team</h3>
          <div className="team-grid">
            {[
              { name: 'Member 1', role: 'Backend & AI Pipeline' },
              { name: 'Member 2', role: 'Frontend & 3D Visualization' },
              { name: 'Member 3', role: 'Telephony & Integration' },
              { name: 'Member 4', role: 'Testing & Documentation' },
            ].map((m, i) => (
              <div key={i} className="team-member">
                <div className="member-avatar">{m.name.charAt(0)}</div>
                <div className="member-info">
                  <span className="member-name">{m.name}</span>
                  <span className="member-role mono">{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4 className="footer-section-title mono">PROJECT</h4>
            <a href="https://github.com/your-org/savior" className="footer-link" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">API Reference</a>
          </div>
          <div className="footer-section">
            <h4 className="footer-section-title mono">TECHNOLOGY</h4>
            <span className="footer-link">FastAPI + Python</span>
            <span className="footer-link">React + Three.js</span>
            <span className="footer-link">Deepgram STT</span>
            <span className="footer-link">Twilio API</span>
          </div>
          <div className="footer-section">
            <h4 className="footer-section-title mono">INSTITUTION</h4>
            <span className="footer-link">Your University Name</span>
            <span className="footer-link">Dept. of Computer Science</span>
            <span className="footer-link">Academic Year 2024-25</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-brand">
          <span className="footer-logo">◆</span>
          <span className="footer-name">SAVIOR</span>
        </div>
        <p className="footer-copy mono">Situational Analysis & Virtual Intelligent Operational Router</p>
        <p className="footer-year mono">2025</p>
      </div>
    </footer>
  );
}
