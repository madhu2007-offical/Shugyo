import { useState } from 'react';
import { ROADMAP_NODES } from '../data/trackerData';

const getResourceAvatar = (r) => {
  const name = r.name.toLowerCase();
  let initials = 'RES';
  let bg = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'; // blue default
  
  if (name.includes('cmu') || name.includes('pavlo')) {
    initials = 'CMU';
    bg = 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)'; // red
  } else if (name.includes('mit')) {
    initials = 'MIT';
    bg = 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)'; // violet
  } else if (name.includes('ddia') || name.includes('kleppmann')) {
    initials = 'DDIA';
    bg = 'linear-gradient(135deg, #6366f1 0%, #3730a3 100%)'; // indigo
  } else if (name.includes('gate') || name.includes('smasher') || name.includes('ravindra')) {
    initials = 'GATE';
    bg = 'linear-gradient(135deg, #10b981 0%, #065f46 100%)'; // emerald
  } else if (name.includes('stanford') || name.includes('widom')) {
    initials = 'STAN';
    bg = 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'; // amber
  } else if (r.type.toLowerCase().includes('book') || name.includes('concepts')) {
    initials = '📖';
    bg = 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'; // pink
  } else if (r.type.toLowerCase().includes('video') || r.type.toLowerCase().includes('playlist')) {
    initials = '📺';
    bg = 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'; // cyan
  }
  
  return (
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: initials.length > 3 ? '8.5px' : '11px',
      color: '#fff',
      fontFamily: 'var(--font-mono)',
      border: '1px solid rgba(255,255,255,0.1)',
      flexShrink: 0
    }}>
      {initials}
    </div>
  );
};

export function Resources() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openPhases, setOpenPhases] = useState({ 0: true }); // Open P0 by default

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    if (filterId !== 'all') {
      setOpenPhases({ [filterId]: true });
    }
  };

  const handleTogglePhase = (phaseId) => {
    setOpenPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const visibleNodes = activeFilter === 'all' 
    ? ROADMAP_NODES 
    : ROADMAP_NODES.filter(p => p.id === activeFilter);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Resource Library</h1>
          <p>Courses, playlists, and reading material mapped to each roadmap phase.</p>
        </div>
      </div>

      {/* Phase Filter Chips */}
      <div className="phase-filter scroll-reveal visible" style={{ marginBottom: '2rem' }}>
        <button
          className={`chip ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          All phases
        </button>
        {ROADMAP_NODES.map((p) => (
          <button
            key={p.id}
            className={`chip ${activeFilter === p.id ? 'active' : ''}`}
            onClick={() => handleFilterClick(p.id)}
          >
            {p.code} · {p.name}
          </button>
        ))}
      </div>

      {/* Phase Blocks */}
      <div id="phase-list">
        {visibleNodes.map((p, pIdx) => {
          const isOpen = !!openPhases[p.id];
          return (
            <div 
              key={p.id} 
              className={`phase-block scroll-reveal visible stagger-item-${(pIdx % 3) + 1} ${isOpen ? 'open' : ''}`}
            >
              <div className="phase-head" onClick={() => handleTogglePhase(p.id)}>
                <div className="phase-head-left">
                  <span className="phase-num">{p.code}</span>
                  <span className="phase-name">{p.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className="phase-time">{p.time}</span>
                  <span className="phase-toggle" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>▾</span>
                </div>
              </div>
              
              <div className="phase-body" style={{ maxHeight: isOpen ? '1600px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div className="phase-body-inner">
                  <div className="phase-topics" style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                    <b>Topics:</b> {p.topics}
                  </div>
                  <div className="res-grid">
                    {p.resources.map((r, rIdx) => (
                      <div key={rIdx} className="res-card" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        {getResourceAvatar(r)}
                        <div style={{ flexGrow: 1 }}>
                          <div className="res-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span className="res-type" style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: '600' }}>{r.type}</span>
                            <span className={`res-badge ${r.origin === 'in' ? 'badge-in' : 'badge-intl'}`} style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                              {r.origin === 'in' ? 'INDIA' : 'INTL'}
                            </span>
                          </div>
                          <div className="res-name" style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{r.name}</div>
                          <div className="res-desc" style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5', marginBottom: '10px' }}>{r.desc}</div>
                          <a 
                            className="res-link" 
                            href={r.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}
                          >
                            Open resource →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Resources;
