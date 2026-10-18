import React, { useEffect, useState, useRef } from 'react';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GestureGuideModal } from './components/GestureGuideModal';
import { HeritageExplorer } from './components/HeritageExplorer';
import { AudioTourView } from './components/AudioTourView';
import { 
  IconGlobe, 
  IconHelpCircle, 
  IconMapPin, 
  IconShieldCheck, 
  IconSparkles,
  IconBot,
  IconCamera,
  IconBookOpen,
  IconCompass,
  IconSettings,
  IconMic,
  IconMicOff,
  IconVolume,
  IconSmartphone
} from './components/Icons';
import { RobotAvatar } from './components/RobotAvatar';
import { VisionDetector } from './components/VisionDetector';
import { VoiceWaveform } from './components/VoiceWaveform';
import { VERIFIED_HERITAGE_DATA } from './data/karnatakaData';

export default function App() {
  // Navigation Tabs: 'guide' | 'vision' | 'places' | 'tour' | 'settings'
  const [activeTab, setActiveTab] = useState('guide');

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("To install: on mobile tap browser menu (⋮) -> 'Add to Home Screen' or 'Install App'. On desktop Edge/Chrome, click the install icon in the address bar.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    }
  };

  // Location & Weather state
  const [currentLocation, setCurrentLocation] = useState("Virupaksha Temple, Hampi");
  const [currentWeather, setCurrentWeather] = useState("32°C (Sunny)");

  // Robot State
  const [robotState, setRobotState] = useState('idle'); // idle, listening, thinking, speaking, gesture
  const [activeLanguage, setActiveLanguage] = useState('en'); // en, kn, hi
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSpeechText, setCurrentSpeechText] = useState(
    "Namaskara! I am Yantramanava, your AI Karnataka Heritage Guide. Tap the mic or choose any heritage destination."
  );
  const [activeGesture, setActiveGesture] = useState(null);

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('yantramanava_api_key') || '');

  // Chat message stream
  const [chatLog, setChatLog] = useState([
    {
      sender: 'robot',
      text: "Namaskara! Welcome to Karnataka - One State, Many Worlds. I am Yantramanava. Speak or type to explore our heritage."
    }
  ]);
  const [textInput, setTextInput] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'guide') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, activeTab]);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('yantramanava_api_key', key);
  };

  // Speech Synthesis
  const speakText = (text, lang = activeLanguage) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (lang === 'kn') {
      utterance.lang = 'kn-IN';
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setRobotState('speaking');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setRobotState('idle');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setRobotState('idle');
    };

    setCurrentSpeechText(text);
    window.speechSynthesis.speak(utterance);
  };

  // Verified RAG Query Engine
  const handleQuery = (queryText) => {
    if (!queryText.trim()) return;

    setRobotState('thinking');
    const userMsg = { sender: 'user', text: queryText };
    setChatLog((prev) => [...prev, userMsg]);

    const qLower = queryText.toLowerCase();
    let langToUse = activeLanguage;

    if (qLower.includes('kannada') || /[\u0C80-\u0CFF]/.test(queryText)) {
      langToUse = 'kn';
      setActiveLanguage('kn');
    }

    let foundMatch = null;
    for (const item of VERIFIED_HERITAGE_DATA) {
      if (
        qLower.includes(item.id) ||
        qLower.includes(item.name.toLowerCase()) ||
        qLower.includes(item.location.toLowerCase())
      ) {
        foundMatch = item;
        setCurrentLocation(`${item.name}, ${item.location}`);
        break;
      }
    }

    let responseAnswer = "";

    if (foundMatch) {
      responseAnswer = langToUse === 'kn' ? foundMatch.kannadaFact : foundMatch.verifiedFact;
    } else if (qLower.includes('hello') || qLower.includes('hi') || qLower.includes('namaskara')) {
      responseAnswer = langToUse === 'kn'
        ? "ನಮಸ್ಕಾರ! ಕರ್ನಾಟಕ ಪ್ರವಾಸೋದ್ಯಮಕ್ಕೆ ಸುಸ್ವಾಗತ. ಹಂಪಿ, ಮೈಸೂರು ಅರಮನೆ, ಬೇಲೂರು, ಕೂರ್ಗ್ ಅಥವಾ ಗೋಕರ್ಣದ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ!"
        : "Namaskara! I am Yantramanava. How can I help you explore Karnataka today?";
    } else {
      responseAnswer = langToUse === 'kn'
        ? "ಕರ್ನಾಟಕವು ಯುನೆಸ್ಕೋ ವಿಶ್ವ ಪಾರಂಪರಿಕ ತಾಣಗಳಾದ ಹಂಪಿ, ಪಟ್ಟದಕಲ್ಲು ಮತ್ತು ಸುಂದರ ಮೈಸೂರು ಅರಮನೆಯನ್ನು ಹೊಂದಿದೆ. ಯಾವುದೇ ಸ್ಥಳದ ಬಗ್ಗೆ ಕೇಳಿ!"
        : "Karnataka is home to magnificent heritage sites like Hampi, Mysore Palace, Belur, and Badami. Feel free to ask about any specific destination!";
    }

    setTimeout(() => {
      const robotMsg = { sender: 'robot', text: responseAnswer };
      setChatLog((prev) => [...prev, robotMsg]);
      speakText(responseAnswer, langToUse);
    }, 400);
  };

  // Web Speech API Microphone Toggle
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      setRobotState('idle');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      if (activeLanguage === 'kn') {
        recognition.lang = 'kn-IN';
      } else if (activeLanguage === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setRobotState('listening');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setRobotState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (robotState === 'listening') setRobotState('idle');
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setRobotState('idle');
    }
  };

  // Gesture detected from Vision
  const handleGestureDetected = (gesture) => {
    if (activeGesture?.key === gesture.key) return;

    setActiveGesture(gesture);
    setRobotState('gesture');

    let response = "";
    if (gesture.key === 'HELP') {
      response = "Accessibility Help Mode Activated! Yantramanava is ready to assist deaf and mute tourists with visual heritage guides.";
    } else if (gesture.key === 'LIKE') {
      response = activeLanguage === 'kn' ? "ಧನ್ಯವಾದಗಳು! (Dhanyavadagalu! Thank you!)" : "Dhanyavadagalu! Thank you for exploring Karnataka heritage!";
    } else if (gesture.key === 'NAMASKARA') {
      response = "Namaskara! Welcome to Karnataka - One State, Many Worlds!";
    } else if (gesture.key === 'STOP') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setRobotState('idle');
      setCurrentSpeechText("Audio stopped via Fist gesture.");
      return;
    } else if (gesture.key === 'OK') {
      response = "Understood! Proceeding with tour itinerary.";
    }

    if (response) {
      speakText(response);
    }
  };

  const handleSelectLandmark = (landmark) => {
    setCurrentLocation(`${landmark.name}, ${landmark.location}`);
    const text = activeLanguage === 'kn' ? landmark.kannadaFact : landmark.verifiedFact;
    setCurrentSpeechText(text);
    handleQuery(`Tell me about ${landmark.name}`);
  };

  const quickPrompts = [
    { label: "🏛️ Hampi", query: "Tell me about Hampi Virupaksha temple and stone chariot" },
    { label: "🏰 Mysore Palace", query: "Tell me about Mysore Palace architecture" },
    { label: "☕ Coorg Hills", query: "Tell me about Coorg coffee plantations" },
    { label: "🏖️ Gokarna", query: "Tell me about Gokarna and Om beach" },
    { label: "🗣️ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಿ", query: "ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಪ್ರವಾಸಿ ತಾಣಗಳ ಬಗ್ಗೆ ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ" }
  ];

  return (
    <div className="app-wrapper">
      {/* MOBILE APP SHELL */}
      <div className="mobile-app-shell">
        {/* 1. NATIVE MOBILE STATUS BAR */}
        <div className="mobile-status-bar">
          <span className="status-time">{currentTime}</span>
          <div className="status-icons">
            <span className="badge badge-emerald">
              <IconShieldCheck size={10} /> 100% RAG
            </span>
            <span>📶 5G</span>
            <span>🔋 100%</span>
          </div>
        </div>

        {/* 2. APP HEADER BAR */}
        <header className="app-header">
          {/* Brand & Robot State */}
          <div className="brand-section">
            <div className="brand-avatar">
              <IconBot size={20} />
              <span className={`status-dot ${isSpeaking ? 'speaking' : isListening ? 'listening' : ''}`} />
            </div>

            <div>
              <div className="brand-title">YANTRAMANAVA</div>
              <div className="brand-sub">
                {isSpeaking ? '● Speaking audio' : isListening ? '● Listening...' : 'Karnataka AI Guide'}
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="header-actions">
            <select
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value)}
              className="lang-select"
            >
              <option value="en">EN</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="hi">हिंदी</option>
            </select>

            {!isAppInstalled && (
              <button
                onClick={handleInstallApp}
                className="btn-header-install"
                title="Install PWA App"
              >
                <IconSmartphone size={12} />
                <span>App</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              className="btn-header-icon"
              title="Settings"
            >
              <IconSettings size={18} />
            </button>
          </div>
        </header>

        {/* 3. DYNAMIC LOCATION & WEATHER TICKER */}
        <div className="location-ticker">
          <div className="location-item">
            <IconMapPin size={12} color="#f43f5e" />
            <span className="location-name">{currentLocation}</span>
          </div>
          <div className="weather-item">
            ⛅ {currentWeather}
          </div>
        </div>

        {/* 4. MAIN SCROLLABLE APP BODY (TABS) */}
        <main className="tab-content-area">
          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <>
              {/* Compact Robot Card */}
              <div className="glass-card glass-card-gold avatar-section">
                <RobotAvatar
                  robotState={robotState}
                  activeLanguage={activeLanguage}
                  isSpeaking={isSpeaking}
                  currentSpeechText={currentSpeechText}
                />
                <VoiceWaveform
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  robotState={robotState}
                />
              </div>

              {/* Quick Prompt Carousel */}
              <div>
                <div className="prompts-title">QUICK DESTINATION INQUIRIES</div>
                <div className="prompts-scroll">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuery(p.query)}
                      className="prompt-chip"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Dialogue Stream */}
              <div className="chat-stream">
                {chatLog.map((msg, i) => (
                  <div key={i} className={`chat-bubble-row ${msg.sender}`}>
                    <div className={`chat-bubble ${msg.sender}`}>
                      {msg.text}
                    </div>
                    <span className="chat-sender">
                      {msg.sender === 'user' ? 'You' : 'Yantramanava AI'}
                    </span>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
            </>
          )}

          {/* TAB 2: VISION */}
          {activeTab === 'vision' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>
                    👁️ MediaPipe Gesture Vision
                  </h3>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Real-time accessibility recognition for deaf/mute visitors
                  </p>
                </div>
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="badge badge-cyan"
                  style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '11px' }}
                >
                  Gesture Guide 🖐️
                </button>
              </div>

              <VisionDetector
                onGestureDetected={handleGestureDetected}
                activeGesture={activeGesture}
              />
            </div>
          )}

          {/* TAB 3: PLACES */}
          {activeTab === 'places' && (
            <div>
              <HeritageExplorer
                onSelectLandmark={(landmark) => {
                  handleSelectLandmark(landmark);
                  setActiveTab('guide');
                }}
                onNarrateText={speakText}
                activeLanguage={activeLanguage}
              />
            </div>
          )}

          {/* TAB 4: TOUR */}
          {activeTab === 'tour' && (
            <div>
              <AudioTourView
                onNarrateText={speakText}
                activeLanguage={activeLanguage}
                onSelectLandmark={(landmark) => {
                  setCurrentLocation(`${landmark.name}, ${landmark.location}`);
                }}
              />
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>
                ⚙️ App Settings & Preferences
              </h3>

              {/* Install PWA Card */}
              <div className="glass-card glass-card-gold" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24'
                  }}>
                    <IconSmartphone size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Install Mobile App</h4>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {isAppInstalled ? 'Yantramanava is installed on your device.' : 'Install on phone or desktop for full-screen offline use.'}
                    </p>
                  </div>
                </div>

                {!isAppInstalled && (
                  <button onClick={handleInstallApp} className="btn-primary" style={{ justifyContent: 'center' }}>
                    Install Yantramanava PWA
                  </button>
                )}
              </div>

              {/* Speech Speed */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: '600', color: '#f8fafc' }}>Audio Speech Speed</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-light)', fontWeight: '700' }}>{speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                  <span>0.8x (Relaxed)</span>
                  <span>1.0x (Normal)</span>
                  <span>1.4x (Fast)</span>
                </div>
              </div>

              {/* OpenAI API Key */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc' }}>OpenAI API Key (Optional)</span>
                  <span className="badge badge-emerald">Verified RAG Active</span>
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                  100% verified facts run locally without any API key. Add OpenAI key for conversational chit-chat.
                </p>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  className="guide-text-input"
                  style={{ borderRadius: '12px' }}
                />
              </div>

              {/* Reset Chat */}
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>Reset Conversation</h4>
                  <p style={{ fontSize: '10px', color: '#94a3b8' }}>Clear chat dialogue history</p>
                </div>
                <button
                  onClick={() => setChatLog([{ sender: 'robot', text: "Namaskara! How can I help you explore Karnataka?" }])}
                  className="badge badge-gold"
                  style={{ cursor: 'pointer', padding: '6px 12px' }}
                >
                  Clear Chat
                </button>
              </div>

              <div style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', paddingTop: '10px' }}>
                <p>Yantramanava AI Karnataka Tourism Robot</p>
                <p>Version 2.0 • PWA Mobile App</p>
              </div>
            </div>
          )}
        </main>

        {/* 5. FLOATING INPUT BAR (Only on Guide Tab) */}
        {activeTab === 'guide' && (
          <div className="guide-input-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (textInput.trim()) {
                  handleQuery(textInput);
                  setTextInput('');
                }
              }}
              className="guide-input-form"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`btn-mic ${isListening ? 'listening' : ''}`}
                title="Tap to speak"
              >
                {isListening ? <IconMicOff size={20} /> : <IconMic size={20} />}
              </button>

              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={activeLanguage === 'kn' ? 'ಪ್ರವಾಸದ ಪ್ರಶ್ನೆ ಕೇಳಿ...' : 'Ask about Hampi, Mysore, Belur...'}
                className="guide-text-input"
              />

              <button
                type="submit"
                disabled={!textInput.trim()}
                className="btn-send"
              >
                ➤
              </button>
            </form>
          </div>
        )}

        {/* 6. BOTTOM NATIVE APP NAVIGATION BAR */}
        <nav className="mobile-bottom-nav">
          <button
            onClick={() => setActiveTab('guide')}
            className={`nav-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
          >
            <IconBot size={20} />
            <span className="nav-tab-label">Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`nav-tab-btn ${activeTab === 'vision' ? 'active' : ''}`}
          >
            <IconCamera size={20} />
            <span className="nav-tab-label">Vision</span>
          </button>

          <button
            onClick={() => setActiveTab('places')}
            className={`nav-tab-btn ${activeTab === 'places' ? 'active' : ''}`}
          >
            <IconBookOpen size={20} />
            <span className="nav-tab-label">Places</span>
          </button>

          <button
            onClick={() => setActiveTab('tour')}
            className={`nav-tab-btn ${activeTab === 'tour' ? 'active' : ''}`}
          >
            <IconCompass size={20} />
            <span className="nav-tab-label">Tour</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <IconSettings size={20} />
            <span className="nav-tab-label">Settings</span>
          </button>
        </nav>
      </div>

      {/* Modals */}
      <GestureGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSimulateGesture={handleGestureDetected}
      />

      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
