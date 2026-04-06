# SAVIOR: Situational Analysis & Virtual Intelligent Operational Router

> AI-powered emergency call triage system — from panicked call to precise dispatch in seconds.

SAVIOR receives emergency calls via Twilio, transcribes audio in real-time using Deepgram STT, analyzes the situation with an NLP pipeline, and pushes structured emergency data to a real-time dispatcher dashboard built with React, Three.js, and GSAP.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Twilio     │────>│  FastAPI     │────>│  Deepgram     │────>│  NLP Pipeline│────>│  React Dashboard │
│  Voice API   │     │  Backend     │     │  STT Nova-2   │     │  (Phase 2)   │     │  WebSocket       │
└─────────────┘     │  :8000       │     │  en-IN 8kHz   │     │              │     │  :5173           │
                    │  /ws/twilio  │     └───────────────┘     └──────────────┘     └──────────────────┘
                    │  /ws/dashboard│───────────────────────────────────────────────────────────────────>│
                    └──────────────┘
```

### Data Flow

1. **Call Received** — User dials emergency number. Twilio webhook triggers and streams raw mu-law audio to FastAPI via WebSocket.
2. **Real-Time Transcription** — Audio forwarded to Deepgram Nova-2. Returns live transcript with Indian English (en-IN) recognition.
3. **AI Analysis** — NLP pipeline classifies emergency type, extracts location via NER, and assigns severity score 1-10.
4. **Smart Dispatch** — Analysis merged with companion app GPS + medical data. Complete package pushed to dashboard via WebSocket.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.14, FastAPI, uvicorn, WebSockets |
| **AI / ML** | Deepgram Nova-2, NLP Pipeline, NER, Classification |
| **Telephony** | Twilio Voice API, WebRTC, mu-law 8kHz Audio |
| **Frontend** | React 19, Vite, Three.js, GSAP, Lenis Smooth Scroll |

---

## Project Structure

```
Savior/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI server + WebSocket endpoints
│   └── services/
│       ├── __init__.py
│       └── stt_service.py      # Deepgram STT service
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navigation, TeamFooter
│   │   │   ├── scenes/         # HeroSection, LiveDemoSection, Architecture, HowItWorks, Results
│   │   │   ├── three/          # Globe, IndiaMap, ParticleField, RadarSweep
│   │   │   └── ui/             # EmergencyCard, LiveTranscript
│   │   ├── hooks/              # useWebSocket, useLenis
│   │   ├── lib/                # GSAP config
│   │   ├── styles/             # Global CSS, depth system, animations
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # React entry point
│   ├── .env                    # VITE_WS_URL=ws://localhost:8000/ws/dashboard
│   └── package.json
├── .env                        # Backend secrets (gitignored)
├── .env.example                # Template for collaborators
├── .gitignore
├── requirements.txt            # Python dependencies
├── twilo_demo.py               # Twilio call simulation script
└── README.md
```

---

## Setup Guide

### Prerequisites

- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)
- [Ngrok](https://ngrok.com/download) (for exposing local server to Twilio)

### 1. Clone the Repository

```bash
git clone https://github.com/Abdul-Jawad-Bankapur/Savior.git
cd Savior
git checkout feature/savior_frontend
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate    # Windows
source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API keys (copy from .env.example)
# TWILIO_ACCOUNT_SID=your_sid_here
# TWILIO_AUTH_TOKEN=your_token_here
# DEEPGRAM_API_KEY=your_key_here
# NGROK_URL=https://your-ngrok-url.ngrok-free.app
# TO_NUMBER=+91your_verified_number
# FROM_NUMBER=+1your_twilio_number
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# .env is already configured with:
# VITE_WS_URL=ws://localhost:8000/ws/dashboard
```

---

## Running the Application

### Start Backend

```bash
# From project root (with .venv activated)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at **http://localhost:8000**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check — returns status + active dashboard connections |
| `/ws/twilio` | WebSocket | Receives live audio stream from Twilio |
| `/ws/dashboard` | WebSocket | Pushes transcripts + analysis to React frontend |
| `/twilio/voice` | POST | Twilio webhook handler — returns TwiML to start streaming |

### Start Frontend

```bash
# From frontend/ directory
npm run dev
```

Frontend runs at **http://localhost:5173**

### Verify Integration

1. Start backend → visit http://localhost:8000/ — should show `{"status": "online"}`
2. Start frontend → visit http://localhost:5173/ — System Status panel should show **"WebSocket"** (green)
3. If backend is not running, frontend falls back to mock data automatically

### Expose Backend with Ngrok (for Twilio calls)

```bash
# In a separate terminal
ngrok http 8000
```

Copy the `https://...` URL and set it in `.env`:
```
NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

### Test with a Phone Call

```bash
# Make sure .env has all required variables
python twilo_demo.py
```

Answer the call, speak clearly, and watch the transcript appear live on the dashboard at http://localhost:5173/.

---

## Frontend Features

### Live Demo Section
- Real-time emergency cards with severity bars, location, and transcript
- Working action buttons: **Dispatch Unit** and **Mark Resolved** (click to change status)
- Auto-generates new emergency calls every 12 seconds for demo purposes
- Live transcript panel with typewriter effect
- System status panel showing STT engine, model, connection state

### 3D Visualization
- Rotating wireframe globe with pulsing emergency hotspots over Indian cities
- 3D situation map with severity-based data bars
- Radar sweep effect and ambient particle field

### Architecture Pipeline
- Visual data flow: Twilio → FastAPI → Deepgram → NLP → WebSocket → Dashboard
- Each layer shows technology stack and description

### Results Section
- Before/after comparison metrics
- Complete technology stack organized by layer

---

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | Twilio → WebSocket → Deepgram STT → Live transcription → Dashboard push |
| **Phase 2** | 🚧 Planned | NLP pipeline: emergency classification, NER location extraction, severity scoring |
| **Phase 3** | 🚧 Planned | Android companion app: GPS + medical profile merge, real-time dashboard push |
| **Phase 4** | 🚧 Planned | ML-based dispatch optimization, historical analytics, predictive routing |

---

## Team

| Member | Role |
|--------|------|
| Member 1 | Backend & AI Pipeline |
| Member 2 | Frontend & 3D Visualization |
| Member 3 | Telephony & Integration |
| Member 4 | Testing & Documentation |

**Institution:** Your University Name — Department of Computer Science  
**Academic Year:** 2024-25

---

## Security

- All secrets (API keys, phone numbers) are loaded from `.env` — never hardcoded
- `.env` is in `.gitignore` and will never be committed
- `.env.example` provides a template for new collaborators
- CORS is configured for development; restrict `allow_origins` in production

---

## License

This project is developed as part of an academic curriculum. All rights reserved.
