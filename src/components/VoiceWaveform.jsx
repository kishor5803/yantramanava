import React, { useEffect, useState } from 'react';

export const VoiceWaveform = ({ isSpeaking, isListening, robotState }) => {
  const [bars, setBars] = useState([12, 24, 38, 18, 42, 28, 50, 20, 34, 16, 45, 22, 30, 15, 40]);

  useEffect(() => {
    let interval;
    if (isSpeaking || isListening) {
      interval = setInterval(() => {
        setBars(
          Array.from({ length: 24 }, () => Math.floor(Math.random() * 45) + 8)
        );
      }, 100);
    } else {
      setBars([8, 12, 16, 14, 18, 12, 20, 14, 16, 12, 14, 10, 8, 12, 14, 10, 8, 12, 16, 14, 18, 12, 10, 8]);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, isListening]);

  const activeColor = isSpeaking ? '#10b981' : isListening ? '#06b6d4' : '#f59e0b';

  return (
    <div className="w-full flex flex-col items-center justify-center my-3">
      <div className="flex items-center justify-center gap-1.5 h-12 w-full px-6 bg-slate-950/60 rounded-xl border border-slate-800/80">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all duration-150"
            style={{
              height: `${h}px`,
              backgroundColor: (isSpeaking || isListening) ? activeColor : '#334155',
              boxShadow: (isSpeaking || isListening) ? `0 0 10px ${activeColor}` : 'none'
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono tracking-widest text-slate-400 mt-1 uppercase">
        {isSpeaking ? "🔊 REACTIVE VOICE WAVEFORM (OUTPUT SOUND)" : isListening ? "🎙️ AUDIO INPUT WAVEFORM (LISTENING)" : "⚡ STANDBY WAVEFORM ENGINE"}
      </span>
    </div>
  );
};
