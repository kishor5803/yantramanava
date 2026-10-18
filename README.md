# 🤖 Yantramanava (ಯಂತ್ರಮಾನವ)
### AI Karnataka Heritage Tour Guide & Accessibility Robot

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-f59e0b.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Yantramanava** is an official AI Tour Guide & Accessibility Robot engineered for **Karnataka Tourism**. It bridges historical preservation with modern AI accessibility, featuring verified Anti-Fake Guide RAG facts, multilingual voice narration (English & Kannada), and MediaPipe-powered sign language recognition for deaf and mute tourists.

---

## 🌟 Key Features

1. **Anti-Fake Guide Verified RAG Engine**:
   - Fact-checked historical data curated for Karnataka's UNESCO World Heritage landmarks (Hampi, Mysore Palace, Belur, Halebidu, Badami, Pattadakal, Coorg, Gokarna, etc.).
   - Prevents AI hallucinations and fake tourist guide myths.

2. **Multilingual Voice Interaction**:
   - Bilingual support: **English** and **ಕನ್ನಡ (Kannada)**.
   - Speech Recognition and responsive Speech Synthesis with custom audio speed tuning.

3. **MediaPipe Sign Language & Gesture Accessibility**:
   - Computer vision hand-gesture tracking for accessibility:
     - 🖐️ **Open Palm**: Accessibility Help Mode
     - ✌️ **Peace / V-Sign**: Namaskara / Greetings
     - 👍 **Thumbs Up**: Confirmation / Like
     - ✊ **Fist**: Stop Narration
     - 👌 **OK Sign**: Understood

4. **Mobile-First Progressive Web App (PWA)**:
   - Modern dark glassmorphic app shell with bottom tab navigation.
   - 5 core tabs: **Guide**, **Vision**, **Places**, **Tour**, and **Settings**.
   - Fully installable on iOS, Android, and Windows desktop.

---

## 🚀 Quick Start

### 1. Python Robot Interface
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the terminal interactive robot
python yantramanava.py
```

### 2. Mobile-First Web Application
```bash
# Install NPM dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📁 Project Structure

```text
├── yantramanava.py           # Core Python Tour Guide Robot (RAG + Vision + TTS)
├── pyrefly.toml              # Pyrefly Static Type Checker configuration
├── requirements.txt          # Python dependencies
├── package.json              # Web app dependencies & build scripts
├── public/
│   ├── manifest.json         # PWA Manifest
│   ├── sw.js                 # Service Worker for offline caching
│   └── pwa-icon.svg          # App Vector Icon
├── src/
│   ├── App.jsx               # Mobile-First App Shell & Tab Navigation
│   ├── index.css             # Vanilla CSS Design System (Dark Glassmorphism)
│   ├── components/
│   │   ├── RobotAvatar.jsx   # Animated SVG Robot Avatar
│   │   ├── VoiceWaveform.jsx # Reactive Audio Waveform Engine
│   │   ├── VisionDetector.jsx# MediaPipe Hand Gesture Recognition HUD
│   │   ├── HeritageExplorer.jsx # Verified Karnataka Heritage Directory
│   │   ├── AudioTourView.jsx # Step-by-Step Grand Route Audio Tour
│   │   └── Icons.jsx         # Custom SVG Icon Library
│   └── data/
│       └── karnatakaData.js  # Verified Heritage Knowledge Base
```

---

## 🏛️ Verified Destinations

- **Hampi**: Capital of Vijayanagara Empire, Virupaksha Temple, Stone Chariot.
- **Mysore Palace**: Official seat of Wadiyar dynasty, Indo-Saracenic architecture.
- **Belur & Halebidu**: 12th-century Hoysala soapstone architecture & Madanika figures.
- **Badami & Pattadakal**: UNESCO Chalukyan rock-cut cave architecture.
- **Coorg (Kodagu)**: Scotland of India, Talakaveri, Abbey Falls, coffee estates.
- **Gokarna**: Coastal pilgrimage, Atmalinga, Om Beach.
- **Jog Falls**: Second-steepest waterfall in India on River Sharavathi.

---

## 📜 License
MIT License. © 2026 Karnataka Tourism AI Robot Project.
