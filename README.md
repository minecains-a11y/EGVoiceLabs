# EGVoiceLabs (EGVL) 🎙️⚡
> **"Your voice. Your sound. Your lab."**

An enterprise-grade, full-stack AI audio generation platform inspired by ElevenLabs. EGVL unifies **ultra-realistic Text-to-Speech**, **Instant & Professional Voice Cloning**, **Synthetic Voice Design**, **AI Music Generation**, and **Sound Effects Generation** inside a cohesive dark-mode-first creative studio.

---

## 🌟 Key Features & Core Modules

### 1. Text-to-Speech Studio (`/studio/tts`)
- **Large Text Editor**: Up to 5,000 characters per run with live character, word, and credit estimation.
- **SSML Tag Insertion**: Quick tags for `[pause 1s]`, `[whisper]`, `[excited]`, `[emphasis]`, and `[sigh]`.
- **Advanced Voice Controls**: Fine-tune Stability, Clarity/Similarity, Style Exaggeration, Speaking Pace (0.7x - 1.5x), and Speaker Boost.
- **Model Toggles**: Switch seamlessly between **EGVL Turbo** (ultra-low latency) and **EGVL Multilingual** (high-fidelity across 29+ languages).
- **Interactive Waveform Player**: Real-time canvas waveform, seek scrubber, playback speed cycling (0.75x to 2x), volume slider, loop toggle, and instant WAV/MP3 downloads.

### 2. Voice Cloning Studio (`/studio/clone`)
- **Instant Clone**: Upload or record 1–5 minutes of clean voice to create a digital voice replica in seconds.
- **Professional Clone**: Upload 30+ minutes of studio audio with a queued neural training pipeline.
- **In-Browser Mic Recorder**: Live Web Audio API `AnalyserNode` monitoring real-time volume dB meters, clipping distortion alerts, and background noise floor.
- **Phonetic Calibration Scripts**: Built-in scripts for reading calibration and emotional nuance.
- **Mandatory Consent & Biometric Matching**:
  - Legal declaration checkbox confirming voice ownership.
  - Live phrase reading verification step matching acoustic biometrics against uploaded samples.
  - Protection against unauthorized public figure / politician cloning.

### 3. Voice Designer (`/studio/design`)
- Synthesize brand-new synthetic voices from controls without any source audio.
- Specify **Gender**, **Age Group** (young, middle-aged, old), **Accent**, **Vocal Timbre** (warm, deep, raspy, bright), **Pitch**, and **Natural Language Description**.
- Synthesizes 3 preview variations; save your favorite variation directly to **My Voices**.

### 4. AI Music Generator (`/studio/music`)
- Prompt-based musical composition (e.g., *"Upbeat lo-fi hip hop with soft electric piano and gentle vinyl crackle, 80 BPM"*).
- Control **Genre**, **Mood**, **Key**, **BPM Tempo** (60–180), and **Duration**.
- Instrumental vs. Vocal toggle with optional lyrics input.
- Composes 2 takes per request with track extension (`+15s`) and favorites.
- Copyright protection preventing prompt imitation of named recording artists.

### 5. Sound Effects Generator (`/studio/sfx`)
- Turn text prompts into Foley effects, UI chimes, ambient weather, and cinematic impacts.
- Duration slider (0.5s to 22s), prompt guidance slider, and seamless loop toggle.
- Generates 4 variations in a preview grid.

### 6. Multitrack Timeline & Projects (`/projects`)
- Multi-track DAW timeline where users can arrange Speech, Music, and SFX clips.
- Track volume controls, Mute, Solo, clip deletion, playhead scrubbing, and **Master Mix (WAV) Export**.

### 7. AI Speech Classifier & Watermarking (`/classifier`)
- Invisible cryptographic ultrasonic watermark embedded in all synthesized audio files.
- Upload any audio recording to detect whether it originated from EGVoiceLabs.

### 8. Full Platform Ecosystem
- **Public Voice Marketplace (`/voices`)**: Browse, bookmark, preview, and use community & premade voices.
- **Developer REST API & Docs (`/docs`)**: Endpoints with cURL, Python, and TypeScript SDK examples.
- **Admin & Safety Portal (`/admin`)**: Moderation queue for flagged content, user ban toggles, and incident metrics.
- **GDPR Privacy & Data Ownership (`/settings`)**: Export complete JSON archives and permanently purge voice samples.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React
- **Audio Engine**: Web Audio API (real-time procedural synthesis, PCM RIFF WAV encoding, RMS dB metering)
- **State Management**: Reactive React Context with localStorage persistence
- **Safety**: Automated prompt moderation engine & ultrasonic watermarking
- **Styling**: Dark-mode-first brand palette (`#0B0B12`, electric violet `#7C3AED`, cyan `#06B6D4`)

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18+ (tested on Node v22)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/egvl.git
cd EGVL

# Install dependencies
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Guide

### Deploying the Next.js Frontend to Vercel
1. Push your repository to GitHub or GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. Set the environment variables from `.env.example`.
4. Deploy with standard Next.js build settings (`next build`).

### Connecting a Live GPU Worker (Modal / RunPod / Replicate)
In production, switch `AI_PROVIDER_MODE=production` in `.env.local`:
```env
AI_PROVIDER_MODE=production
MODAL_API_ENDPOINT=https://your-modal-app.modal.run
REPLICATE_API_TOKEN=r8_your_replicate_token
OPENAI_API_KEY=sk_your_key_for_whisper_stt
```

Example Modal GPU worker pattern for XTTS-v2 / Stable Audio:
```python
import modal

app = modal.App("egvl-inference")
image = modal.Image.debian_slim().pip_install("torch", "TTS", "soundfile")

@app.function(image=image, gpu="A10G")
def generate_speech(text: str, speaker_wav: str):
    from TTS.api import TTS
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)
    tts.tts_to_file(text=text, speaker_wav=speaker_wav, file_path="/tmp/output.wav")
    with open("/tmp/output.wav", "rb") as f:
        return f.read()
```

---

## ⚖️ Safety & Legal Trust

- **Mandatory Consent**: Voice cloning requires explicit legal declaration and acoustic biometric matching.
- **Protected Figures**: Cloning politicians and public figures is strictly blocked by automated filters.
- **Audio Watermarking**: All generated audio contains an imperceptible ultrasonic tag verifiable via `/classifier`.
- **Content Moderation**: Automated filters prevent generation of CSAM, hate speech, financial fraud, and unauthorized copyrighted song imitation.

---

## 📄 License
Commercial rights included for Starter, Creator, and Pro subscription tiers. Non-commercial license applies to Free tier generations.
