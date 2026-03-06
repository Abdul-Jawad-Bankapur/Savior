# SAVIOR: Situational Analysis & Virtual Intelligent Operational Router

SAVIOR is an AI-powered emergency call triage system that handles simulated emergency phone calls, transcribes them in real-time using Deepgram, and analyzes the situation (emergency type, location, severity).

---

## Team Setup Guide: Phase 1 (Backend & STT)

Follow these steps to set up and run the SAVIOR backend with your own API keys.

### 1. Prerequisites
Ensure you have the following installed:
*   [Python 3.11+](https://www.python.org/downloads/)
*   [Git](https://git-scm.com/downloads)
*   [Ngrok](https://ngrok.com/download) (Download and install to your PATH)

---

### 2. Clone and Environment Setup
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Abdul-Jawad-Bankapur/Savior.git
    cd Savior
    ```
2.  **Create a Virtual Environment:**
    ```bash
    python -m venv .venv
    .\.venv\Scripts\activate  # Windows
    source .venv/bin/activate # macOS/Linux
    ```
3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

---

### 3. API Credentials Configuration
1.  **Get Your Keys:**
    *   **Twilio:** Sign up at [twilio.com](https://www.twilio.com/console) to get your `Account SID`, `Auth Token`, and a **Twilio Phone Number**.
    *   **Deepgram:** Sign up at [deepgram.com](https://console.deepgram.com/) to get an `API Key`.
2.  **Create a `.env` File:**
    Create a new file named `.env` in the root directory and add the following:
    ```env
    TWILIO_ACCOUNT_SID=your_sid_here
    TWILIO_AUTH_TOKEN=your_token_here
    DEEPGRAM_API_KEY=your_key_here
    ```

---

### 4. Local Testing with Ngrok
1.  **Start the FastAPI Server:**
    ```bash
    uvicorn app.main:app --reload
    ```
2.  **Expose the Server:**
    In a **separate** terminal, run:
    ```bash
    ngrok http 8000
    ```
3.  **Update `twilo_demo.py`:**
    *   Copy the `https://...` URL from Ngrok's "Forwarding" line.
    *   Paste it into `PUBLIC_URL` in `twilo_demo.py`.
    *   Update `TO_NUMBER` with your verified phone number.
    *   Update `FROM_NUMBER` with your Twilio phone number.

---

### 5. Run the Call Simulation
1.  **Initiate the Call:**
    ```bash
    python twilo_demo.py
    ```
2.  **Test Transcription:**
    *   Answer the call on your phone.
    *   Speak clearly after the "SAVIOR Emergency System is active" message.
    *   **Check your FastAPI terminal:** You should see live transcripts of your speech appearing in real-time.
