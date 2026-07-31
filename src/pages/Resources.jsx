import { useState } from 'react';
import { ROADMAP_NODES } from '../data/trackerData';

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
      <div className="phase-filter">
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
        {visibleNodes.map((p) => {
          const isOpen = !!openPhases[p.id];
          return (
            <div key={p.id} className={`phase-block ${isOpen ? 'open' : ''}`}>
              <div className="phase-head" onClick={() => handleTogglePhase(p.id)}>
                <div className="phase-head-left">
                  <span className="phase-num">{p.code}</span>
                  <span className="phase-name">{p.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className="phase-time">{p.time}</span>
                  <span className="phase-toggle" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
              </div>
              
              <div className="phase-body" style={{ maxHeight: isOpen ? '1600px' : '0px' }}>
                <div className="phase-body-inner">
                  <div className="phase-topics">
                    <b>Topics:</b> {p.topics}
                  </div>
                  <div className="res-grid">
                    {p.resources.map((r, rIdx) => (
                      <div key={rIdx} className="res-card">
                        <div className="res-top">
                          <span className="res-type">{r.type}</span>
                          <span className={`res-badge ${r.origin === 'in' ? 'badge-in' : 'badge-intl'}`}>
                            {r.origin === 'in' ? 'INDIA' : 'INTL'}
                          </span>
                        </div>
                        <div className="res-name">{r.name}</div>
                        <div className="res-desc">{r.desc}</div>
                        <a 
                          className="res-link" 
                          href={r.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Open resource →
                        </a>
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
