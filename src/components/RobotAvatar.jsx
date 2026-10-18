import React from 'react';

export const RobotAvatar = ({ robotState, activeLanguage, isSpeaking, currentSpeechText }) => {
  const getStateColor = () => {
    switch (robotState) {
      case 'listening': return '#06b6d4'; // Cyan
      case 'thinking': return '#8b5cf6';  // Purple
      case 'speaking': return '#10b981';  // Emerald
      case 'gesture': return '#ec4899';   // Pink
      default: return '#f59e0b';          // Gold
    }
  };

  const stateColor = getStateColor();

  return (
    <div className="robot-avatar-container">
      {/* Speech Bubble floating above Robot */}
      {currentSpeechText && (
        <div className="robot-speech-card" style={{ borderLeftColor: stateColor }}>
          <div className="robot-speech-header" style={{ color: stateColor }}>
            <span>🤖 Yantramanava ({activeLanguage.toUpperCase()})</span>
            {isSpeaking && <span className="live-voice-indicator">● LIVE VOICE</span>}
          </div>
          <p className="robot-speech-text">{currentSpeechText}</p>
        </div>
      )}

      {/* Futuristic Robot Canvas / SVG Container */}
      <div className="robot-canvas-wrapper">
        <svg 
          width="150" 
          height="185" 
          viewBox="0 0 180 220" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="robot-svg"
          style={{ filter: `drop-shadow(0 0 18px ${stateColor}99)` }}
        >
          {/* Head Antennas */}
          <rect x="85" y="10" width="10" height="25" rx="5" fill="#334155" />
          <circle cx="90" cy="10" r="8" fill={stateColor}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          
          {/* Side Ears / Head Bolts */}
          <rect x="15" y="60" width="15" height="30" rx="4" fill="#475569" />
          <rect x="150" y="60" width="15" height="30" rx="4" fill="#475569" />

          {/* Robot Head Frame */}
          <rect x="25" y="35" width="130" height="90" rx="24" fill="#0f172a" stroke={stateColor} strokeWidth="3" />
          
          {/* Face Display Screen */}
          <rect x="35" y="45" width="110" height="70" rx="16" fill="#020617" stroke="#1e293b" strokeWidth="2" />

          {/* Glowing Eyes */}
          <g>
            {/* Left Eye */}
            <circle cx="65" cy="70" r="14" fill="#090d16" stroke={stateColor} strokeWidth="2" />
            <circle cx="65" cy="70" r="8" fill={stateColor}>
              {isSpeaking && <animate attributeName="r" values="7;10;7" dur="0.6s" repeatCount="indefinite" />}
            </circle>

            {/* Right Eye */}
            <circle cx="115" cy="70" r="14" fill="#090d16" stroke={stateColor} strokeWidth="2" />
            <circle cx="115" cy="70" r="8" fill={stateColor}>
              {isSpeaking && <animate attributeName="r" values="7;10;7" dur="0.6s" repeatCount="indefinite" />}
            </circle>
          </g>

          {/* Animated Mouth Equalizer / Expression */}
          <g>
            {isSpeaking ? (
              // Equalizer Bars when speaking
              <g fill={stateColor}>
                <rect x="60" y="95" width="5" height="12" rx="2">
                  <animate attributeName="height" values="4;16;4" dur="0.3s" repeatCount="indefinite" />
                </rect>
                <rect x="70" y="95" width="5" height="12" rx="2">
                  <animate attributeName="height" values="12;4;16;12" dur="0.4s" repeatCount="indefinite" />
                </rect>
                <rect x="80" y="95" width="5" height="12" rx="2">
                  <animate attributeName="height" values="6;18;6" dur="0.25s" repeatCount="indefinite" />
                </rect>
                <rect x="90" y="95" width="5" height="12" rx="2">
                  <animate attributeName="height" values="16;6;16" dur="0.35s" repeatCount="indefinite" />
                </rect>
                <rect x="100" y="95" width="5" height="12" rx="2">
                  <animate attributeName="height" values="4;14;4" dur="0.3s" repeatCount="indefinite" />
                </rect>
                <rect x="110" y="95" width="5" height="12" rx="2">
                  <animate attributeName="height" values="10;4;10" dur="0.45s" repeatCount="indefinite" />
                </rect>
              </g>
            ) : robotState === 'listening' ? (
              <path d="M60 98 Q90 110 120 98" stroke={stateColor} strokeWidth="4" strokeLinecap="round" fill="none" />
            ) : robotState === 'gesture' ? (
              <circle cx="90" cy="98" r="7" fill="none" stroke={stateColor} strokeWidth="3" />
            ) : (
              <path d="M65 96 Q90 108 115 96" stroke={stateColor} strokeWidth="4" strokeLinecap="round" fill="none" />
            )}
          </g>

          {/* Neck */}
          <rect x="75" y="125" width="30" height="15" fill="#334155" rx="3" />

          {/* Shoulders / Body Core */}
          <path d="M30 140 H150 L160 210 H20 L30 140 Z" fill="#0f172a" stroke={stateColor} strokeWidth="2" />

          {/* Chest Reactor Core */}
          <circle cx="90" cy="175" r="18" fill="#020617" stroke={stateColor} strokeWidth="3" />
          <polygon points="90,163 100,181 80,181" fill={stateColor} opacity="0.85">
            <animateTransform attributeName="transform" type="rotate" from="0 90 175" to="360 90 175" dur="6s" repeatCount="indefinite" />
          </polygon>
        </svg>
      </div>

      {/* State Status Pill */}
      <div className="robot-badge-row">
        <span className="robot-state-badge" style={{ backgroundColor: `${stateColor}1a`, color: stateColor, borderColor: `${stateColor}55` }}>
          <span className="badge-dot" style={{ backgroundColor: stateColor }} />
          {robotState.toUpperCase()} MODE
        </span>
      </div>
    </div>
  );
};
