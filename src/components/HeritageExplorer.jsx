import React, { useState } from 'react';
import { VERIFIED_HERITAGE_DATA } from '../data/karnatakaData';
import { IconMapPin, IconSearch, IconShieldCheck, IconVolume } from './Icons';

export const HeritageExplorer = ({ onSelectLandmark, onNarrateText, activeLanguage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    'ALL',
    'UNESCO World Heritage',
    'Royal Palaces',
    'Nature & Coffee',
    'Coastal & Pilgrimage'
  ];

  const filteredData = VERIFIED_HERITAGE_DATA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.verifiedFact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header and Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>
              🏛️ Verified Heritage Directory
            </h3>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>
              100% Anti-Fake Guide facts verified by Karnataka Tourism
            </p>
          </div>
          <span className="badge badge-emerald">
            <IconShieldCheck size={11} /> RAG
          </span>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Hampi, Mysore, Belur..."
            className="guide-text-input"
            style={{ width: '100%', paddingLeft: '34px', borderRadius: '14px' }}
          />
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
            <IconSearch size={15} />
          </div>
        </div>
      </div>

      {/* Category Horizontal Bar */}
      <div className="category-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Destination Cards List */}
      <div className="places-list">
        {filteredData.map((item) => (
          <div key={item.id} className="landmark-item">
            {/* Card Hero Image */}
            <div style={{ position: 'relative', width: '100%', height: '140px' }}>
              <img
                src={item.image}
                alt={item.name}
                className="landmark-hero-img"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(7, 10, 18, 0.95), rgba(7, 10, 18, 0.2) 60%, transparent)'
              }} />

              <span className="badge badge-gold" style={{ position: 'absolute', top: '8px', left: '8px' }}>
                {item.category}
              </span>

              <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px' }}>
                <h4 className="landmark-name">
                  {item.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span className="landmark-kannada">{item.kannadaName}</span>
                  <span style={{ fontSize: '10px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <IconMapPin size={10} color="#f43f5e" /> {item.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="landmark-info">
              <p className="landmark-fact">
                {activeLanguage === 'kn' ? item.kannadaFact : item.verifiedFact}
              </p>

              <div style={{
                fontSize: '10px',
                color: '#94a3b8',
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '6px 8px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{ color: 'var(--gold-light)', fontWeight: '700' }}>Gesture: </span>
                {item.gestureShortcut}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <button
                  onClick={() => onSelectLandmark(item)}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '8px 12px' }}
                >
                  Ask Robot Details
                </button>
                <button
                  onClick={() => onNarrateText(activeLanguage === 'kn' ? item.kannadaFact : item.verifiedFact, activeLanguage)}
                  className="btn-secondary"
                  style={{ padding: '8px 10px', color: 'var(--emerald-primary)' }}
                  title="Listen to Narration"
                >
                  <IconVolume size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
