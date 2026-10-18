import React, { useEffect, useState } from 'react';
import { IconGlobe, IconMic, IconMicOff, IconSparkles, IconVolume } from './Icons';

export const VoiceController = ({
  onQuerySubmit,
  isListening,
  setIsListening,
  onSpeechSpeak,
  activeLanguage,
  setActiveLanguage
}) => {
  const [inputText, setInputText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported by your browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Set language according to active selected language
      if (activeLanguage === 'kn') {
        recognition.lang = 'kn-IN';
      } else if (activeLanguage === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        onQuerySubmit(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onQuerySubmit(inputText);
    }
  };

  const handleQuickQuestion = (query) => {
    setInputText(query);
    onQuerySubmit(query);
  };

  return (
    <div className="glass-panel p-5">
      {/* Top Controls: Multilingual Selector & Speech Rates */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <IconGlobe size={18} className="text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">Voice Language:</span>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveLanguage('en')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                activeLanguage === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English 🇬🇧
            </button>
            <button
              onClick={() => setActiveLanguage('kn')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                activeLanguage === 'kn' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ಕನ್ನಡ 🇮🇳
            </button>
            <button
              onClick={() => setActiveLanguage('hi')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                activeLanguage === 'hi' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिंदी 🇮🇳
            </button>
          </div>
        </div>

        {/* Speech Tuning */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <IconVolume size={14} className="text-emerald-400" />
            <span>Speed:</span>
            <select
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200"
            >
              <option value={0.8}>0.8x</option>
              <option value={1.0}>1.0x</option>
              <option value={1.2}>1.2x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Voice & Text Query Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
        {/* Mic Toggle Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3.5 rounded-xl border flex items-center justify-center transition-all ${
            isListening
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-900/40'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
          title="Click to speak your tourist question"
        >
          {isListening ? <IconMicOff size={20} /> : <IconMic size={20} />}
        </button>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeLanguage === 'kn'
                ? 'ಹಂಪಿ ಅಥವಾ ಮೈಸೂರು ಅರಮನೆ ಬಗ್ಗೆ ಕೇಳಿ...'
                : 'Ask Yantramanava about Hampi, Mysore, Belur, Coorg...'
            }
            className="input-field pr-10"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-amber-400 hover:text-amber-300"
          >
            <IconSparkles size={18} />
          </button>
        </div>
      </form>

      {/* Quick Prompt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold whitespace-nowrap">Try asking:</span>
        <button
          type="button"
          onClick={() => handleQuickQuestion("Tell me about Hampi")}
          className="whitespace-nowrap bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
        >
          🏛️ Hampi Stone Chariot
        </button>
        <button
          type="button"
          onClick={() => handleQuickQuestion("What is famous in Mysore Palace?")}
          className="whitespace-nowrap bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
        >
          🏰 Mysore Palace History
        </button>
        <button
          type="button"
          onClick={() => handleQuickQuestion("Tell me about Belur temple architecture")}
          className="whitespace-nowrap bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
        >
          🛕 Belur Hoysala Architecture
        </button>
        <button
          type="button"
          onClick={() => handleQuickQuestion("What makes Coorg special?")}
          className="whitespace-nowrap bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
        >
          ☕ Coorg & Coffee Plantations
        </button>
      </div>
    </div>
  );
};
