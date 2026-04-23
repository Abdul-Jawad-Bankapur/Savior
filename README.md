# SAVIOR: Situational Analysis & Virtual Intelligent Operational Router

> **AI-powered emergency response — Transforming raw audio into precise street-level dispatch in seconds.**

SAVIOR is a real-time emergency management ecosystem. It bridges the gap between a panicked caller and a rescue team by transcribing live audio, geocoding locations, and visualizing the emergency on a high-tech command center dashboard.

---

## 🏗️ Architecture & Data Flow

```
┌─────────────┐      ┌──────────────┐      ┌───────────────┐      ┌──────────────────┐
│   Twilio    │────> │   FastAPI    │────> │   Deepgram    │────> │  React Dashboard │
│  Voice API  │      │   Backend    │      │  STT (Nova-2) │      │  (Leaflet/Carto) │
└─────────────┘      └──────────────┘      └───────────────┘      └──────────────────┘
                            │                                               ^
                            │          ┌───────────────────────┐            │
                            └─────────>│  Nominatim Geocoder   │────────────┘
                                       └───────────────────────┘
```

1. **Audio Ingest:** Twilio streams raw mu-law audio to FastAPI via WebSockets.
2. **Live Transcription:** Deepgram Nova-2 processes Indian English (en-IN) to provide instant text.
3. **Reverse Geocoding:** The system takes raw GPS coordinates and queries the **Nominatim API** to fetch real street addresses.
4. **Smart Visualization:** Structured data is pushed to the React Dashboard via WebSockets, triggering an **Auto-Fly** camera transition and map pin drop.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, WebSockets, Uvicorn |
| **Mapping** | React-Leaflet, CartoDB (Dark Matter), Nominatim API |
| **STT Engine** | Deepgram Nova-2 (en-IN optimization) |
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Telephony** | Twilio Voice SDK, TwiML Streaming |

---

## 🚀 Key Features (Phase 1 Complete)

- **Command Center Dashboard:** A high-contrast, dark-mode interface designed for 24/7 dispatcher environments.
- **Real-Time Address Decoding:** Automatically converts raw coordinates into human-readable locations (e.g., *"Gokul Road, Hubballi"*).
- **Intelligent Camera:** Map automatically pans and zooms (`flyTo`) to the exact location of the newest emergency.
- **Live Transcript Feed:** Typewriter-style scrolling feed of the ongoing emergency call.
- **No-Key Infrastructure:** Optimized using open-source CartoDB and OSM tiles to ensure zero-cost scalability for academic evaluation.

---

## 📂 Project Structure

```
Savior/
├── app/
│   ├── main.py                # FastAPI server & WebSocket Logic
│   └── services/
│       └── stt_service.py     # Deepgram Integration
├── src/
│   ├── components/
│   │   └── DispatcherDashboard.jsx  # Core UI & Mapping Logic
│   └── hooks/
│       └── useWebSocket.js    # Real-time data handling
├── CHANGELOG.md               # Detailed development milestones
└── README.md                  # Project Documentation
```

---

## 📅 Roadmap: Phase 2

- **NLP Pipeline:** Automated emergency classification (Fire, Medical, Crime) and priority scoring.
- **Computer Vision:** Integration of **Driver Drowsiness Detection** models to trigger automated alerts.
- **Android Companion App:** Merging caller medical profiles and live GPS data directly into the dashboard.

---

## 👨‍💻 Team & Institution

**Institution:** [Your University Name] — Department of B.E. Computer Science  
**Academic Year:** 2026-27  
**Status:** Phase 1 Evaluation Ready
