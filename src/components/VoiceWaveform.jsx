import React, { useEffect, useState } from 'react';

export const VoiceWaveform = ({ isSpeaking, isListening, robotState }) => {
  const [bars, setBars] = useState([12, 24, 38, 18, 42, 28, 36, 20, 34, 16, 40, 22, 30, 15, 38, 20, 28, 14]);

  useEffect(() => {
    let interval;
    if (isSpeaking || isListening) {
      interval = setInterval(() => {
        setBars(
          Array.from({ length: 18 }, () => Math.floor(Math.random() * 32) + 6)
        );
      }, 120);
    } else {
      setBars([6, 10, 14, 12, 16, 10, 18, 12, 14, 10, 14, 8, 10, 12, 8, 10, 8, 6]);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, isListening]);

  const activeColor = isSpeaking ? '#10b981' : isListening ? '#06b6d4' : '#f59e0b';

  return (
    <div className="waveform-container">
      <div className="waveform-bar-track">
        {bars.map((h, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              height: `${h}px`,
              backgroundColor: (isSpeaking || isListening) ? activeColor : '#334155',
              boxShadow: (isSpeaking || isListening) ? `0 0 8px ${activeColor}88` : 'none'
            }}
          />
        ))}
      </div>
      <span className="waveform-caption">
        {isSpeaking ? "🔊 VOICE OUTPUT SYNTHESIS" : isListening ? "🎙️ AUDIO INPUT ACTIVE" : "⚡ STANDBY ENGINE"}
      </span>
    </div>
  );
};
