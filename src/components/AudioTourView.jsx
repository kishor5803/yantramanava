import React, { useState } from 'react';
import { VERIFIED_HERITAGE_DATA } from '../data/karnatakaData';
import { IconCompass, IconMapPin, IconShieldCheck, IconVolume } from './Icons';

export const AudioTourView = ({ onNarrateText, activeLanguage, onSelectLandmark }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentLandmark = VERIFIED_HERITAGE_DATA[currentStepIndex];

  const handlePlayCurrent = () => {
    const speechText = activeLanguage === 'kn' 
      ? `ಪ್ರವಾಸದ ನಿಲ್ದಾಣ ${currentStepIndex + 1}: ${currentLandmark.kannadaName}. ${currentLandmark.kannadaFact}`
      : `Tour Stop ${currentStepIndex + 1}: ${currentLandmark.name}. ${currentLandmark.verifiedFact} Timing: ${currentLandmark.timing}.`;
    onNarrateText(speechText);
  };

  const handleNext = () => {
    if (currentStepIndex < VERIFIED_HERITAGE_DATA.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onSelectLandmark(VERIFIED_HERITAGE_DATA[nextIdx]);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onSelectLandmark(VERIFIED_HERITAGE_DATA[prevIdx]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Progress Box */}
      <div className="tour-progress-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🧭 Karnataka Heritage Route
          </span>
          <span className="badge badge-gold">
            STOP {currentStepIndex + 1} OF {VERIFIED_HERITAGE_DATA.length}
          </span>
        </div>

        <div className="tour-bar-track">
          <div 
            className="tour-bar-fill" 
            style={{ width: `${((currentStepIndex + 1) / VERIFIED_HERITAGE_DATA.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Hero Stop Card */}
      <div className="landmark-item" style={{ borderColor: 'var(--border-gold)' }}>
        <div style={{ position: 'relative', width: '100%', height: '170px' }}>
          <img 
            src={currentLandmark.image} 
            alt={currentLandmark.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(7, 10, 18, 0.95), rgba(7, 10, 18, 0.3) 60%, transparent)'
          }} />

          <span className="badge badge-emerald" style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <IconShieldCheck size={11} /> Verified Stop
          </span>

          <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--gold-light)', textTransform: 'uppercase' }}>
              {currentLandmark.category}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: 1.2 }}>
              {activeLanguage === 'kn' ? currentLandmark.kannadaName : currentLandmark.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
              <IconMapPin size={12} color="#f43f5e" />
              <span>{currentLandmark.location}</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#94a3b8' }}>{currentLandmark.timing}</span>
            </div>
          </div>
        </div>

        {/* Card Details */}
        <div className="landmark-info">
          <p className="landmark-fact" style={{ fontWeight: '500', color: '#f8fafc' }}>
            {activeLanguage === 'kn' ? currentLandmark.kannadaFact : currentLandmark.verifiedFact}
          </p>
          <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
            {currentLandmark.history}
          </p>

          <button
            onClick={handlePlayCurrent}
            className="btn-primary"
            style={{ justifyContent: 'center', marginTop: '6px' }}
          >
            <IconVolume size={16} /> Listen to Audio Guide
          </button>

          {/* Stepper Navigation */}
          <div className="tour-stepper-row">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="tour-step-btn"
            >
              ← Previous Stop
            </button>

            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              {currentStepIndex + 1} / {VERIFIED_HERITAGE_DATA.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === VERIFIED_HERITAGE_DATA.length - 1}
              className="tour-step-btn"
              style={{ color: 'var(--gold-light)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            >
              Next Stop →
            </button>
          </div>
        </div>
      </div>

      {/* Tour Milestones List */}
      <div className="glass-card" style={{ padding: '12px 14px' }}>
        <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
          📍 Full Route Milestones
        </h4>
        <div className="tour-milestones-list">
          {VERIFIED_HERITAGE_DATA.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setCurrentStepIndex(idx);
                onSelectLandmark(item);
              }}
              className={`tour-milestone-item ${idx === currentStepIndex ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="milestone-num">{idx + 1}</span>
                <span>{activeLanguage === 'kn' ? item.kannadaName : item.name}</span>
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.location}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
