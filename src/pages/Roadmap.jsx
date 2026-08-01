import { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { ROADMAP_NODES } from '../data/trackerData';

// Illustrative database engineering diagrams per phase
const getPhaseDiagram = (code) => {
  const styles = {
    width: '140px',
    height: '110px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px',
    flexShrink: 0
  };
  
  switch(code) {
    case 'P0':
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <text x="50%" y="12" dominantBaseline="middle" textAnchor="middle" fill="var(--text-faint)" fontSize="7" fontFamily="var(--font-mono)">B-TREE INDEX</text>
          <rect x="38" y="20" width="24" height="12" rx="2" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
          <circle cx="50" cy="26" r="2" fill="var(--accent)" />
          <line x1="50" y1="32" x2="25" y2="52" stroke="var(--border)" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="50" y1="32" x2="75" y2="52" stroke="var(--border)" strokeWidth="1" strokeDasharray="2,2"/>
          <rect x="13" y="52" width="24" height="12" rx="2" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <rect x="63" y="52" width="24" height="12" rx="2" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
        </svg>
      );
    case 'P1':
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <text x="50%" y="12" dominantBaseline="middle" textAnchor="middle" fill="var(--text-faint)" fontSize="7" fontFamily="var(--font-mono)">JOIN ALGEBRA</text>
          <rect x="10" y="22" width="30" height="36" rx="3" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <rect x="10" y="22" width="30" height="10" rx="3" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
          <rect x="60" y="32" width="30" height="26" rx="3" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <rect x="60" y="32" width="30" height="10" rx="3" fill="var(--good-soft)" stroke="var(--good)" strokeWidth="1"/>
          <path d="M 40 40 Q 50 35, 60 45" stroke="var(--warn)" strokeWidth="1.2" fill="none"/>
        </svg>
      );
    case 'P2':
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <text x="50%" y="12" dominantBaseline="middle" textAnchor="middle" fill="var(--text-faint)" fontSize="7" fontFamily="var(--font-mono)">DISK SEGMENTATION</text>
          <rect x="15" y="20" width="70" height="48" rx="4" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <line x1="15" y1="36" x2="85" y2="36" stroke="var(--border)" strokeWidth="1"/>
          <line x1="15" y1="52" x2="85" y2="52" stroke="var(--border)" strokeWidth="1"/>
          <rect x="22" y="24" width="16" height="8" rx="1" fill="var(--good-soft)" stroke="var(--good)" strokeWidth="0.8"/>
          <rect x="42" y="24" width="16" height="8" rx="1" fill="var(--good-soft)" stroke="var(--good)" strokeWidth="0.8"/>
          <rect x="22" y="40" width="22" height="8" rx="1" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="0.8"/>
        </svg>
      );
    case 'P3':
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <text x="50%" y="12" dominantBaseline="middle" textAnchor="middle" fill="var(--text-faint)" fontSize="7" fontFamily="var(--font-mono)">EXECUTION TREE</text>
          <circle cx="50" cy="24" r="8" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
          <text x="50" y="25" textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize="7">⚙</text>
          <line x1="50" y1="32" x2="30" y2="54" stroke="var(--border)" strokeWidth="1"/>
          <line x1="50" y1="32" x2="70" y2="54" stroke="var(--border)" strokeWidth="1"/>
          <circle cx="30" cy="54" r="8" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <circle cx="70" cy="54" r="8" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
        </svg>
      );
    case 'P4':
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <text x="50%" y="12" dominantBaseline="middle" textAnchor="middle" fill="var(--text-faint)" fontSize="7" fontFamily="var(--font-mono)">LRU CACHE PAGE</text>
          <rect x="15" y="22" width="18" height="18" rx="2" fill="var(--good-soft)" stroke="var(--good)" strokeWidth="1"/>
          <rect x="41" y="22" width="18" height="18" rx="2" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <rect x="67" y="22" width="18" height="18" rx="2" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
          <rect x="15" y="48" width="18" height="18" rx="2" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <rect x="41" y="48" width="18" height="18" rx="2" fill="var(--good-soft)" stroke="var(--good)" strokeWidth="1"/>
          <rect x="67" y="48" width="18" height="18" rx="2" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
        </svg>
      );
    case 'P5':
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <text x="50%" y="12" dominantBaseline="middle" textAnchor="middle" fill="var(--text-faint)" fontSize="7" fontFamily="var(--font-mono)">2PL LOCK TABLE</text>
          <rect x="20" y="22" width="24" height="20" rx="3" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1"/>
          <text x="32" y="32" textAnchor="middle" dominantBaseline="middle" fill="var(--danger)" fontSize="8">🔒</text>
          <rect x="56" y="22" width="24" height="20" rx="3" fill="var(--good-soft)" stroke="var(--good)" strokeWidth="1"/>
          <text x="68" y="32" textAnchor="middle" dominantBaseline="middle" fill="var(--good)" fontSize="8">🔓</text>
          <line x1="44" y1="32" x2="56" y2="32" stroke="var(--border)" strokeWidth="1"/>
        </svg>
      );
    case 'P6':
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <text x="50%" y="12" dominantBaseline="middle" textAnchor="middle" fill="var(--text-faint)" fontSize="7" fontFamily="var(--font-mono)">WAL SYSTEM LOG</text>
          <rect x="10" y="22" width="80" height="14" rx="2" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <text x="50" y="29" textAnchor="middle" dominantBaseline="middle" fill="var(--text-dim)" fontSize="7">LSN #3202 | TXN_START</text>
          <rect x="10" y="44" width="80" height="14" rx="2" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
          <text x="50" y="51" textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize="7">LSN #3203 | COMMIT</text>
        </svg>
      );
    case 'P7':
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <text x="50%" y="12" dominantBaseline="middle" textAnchor="middle" fill="var(--text-faint)" fontSize="7" fontFamily="var(--font-mono)">REPLICAS NETWORK</text>
          <circle cx="50" cy="22" r="6" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
          <circle cx="25" cy="52" r="6" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <circle cx="75" cy="52" r="6" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <line x1="44" y1="25" x2="29" y2="48" stroke="var(--border)" strokeWidth="1"/>
          <line x1="56" y1="25" x2="71" y2="48" stroke="var(--border)" strokeWidth="1"/>
          <line x1="31" y1="52" x2="69" y2="52" stroke="var(--border)" strokeWidth="1" strokeDasharray="1,1"/>
        </svg>
      );
    case 'P8':
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <text x="50%" y="12" dominantBaseline="middle" textAnchor="middle" fill="var(--text-faint)" fontSize="7" fontFamily="var(--font-mono)">CLUSTER MAP</text>
          <rect x="15" y="22" width="70" height="14" rx="2" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
          <text x="50" y="29" textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize="7">HAProxy Load Balancer</text>
          <rect x="10" y="48" width="36" height="18" rx="2" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <text x="28" y="57" textAnchor="middle" dominantBaseline="middle" fill="var(--text-dim)" fontSize="6">Primary DB</text>
          <rect x="54" y="48" width="36" height="18" rx="2" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
          <text x="72" y="57" textAnchor="middle" dominantBaseline="middle" fill="var(--text-dim)" fontSize="6">Read Replica</text>
        </svg>
      );
    default:
      return (
        <svg style={styles} viewBox="0 0 100 80">
          <circle cx="50" cy="40" r="10" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1"/>
        </svg>
      );
  }
};

export function Roadmap() {
  const { loading, phaseState, updatePhaseState } = useProgress();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  
  const [updatingNode, setUpdatingNode] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Dragging state
  const [dragActive, setDragActive] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewStart, setViewStart] = useState({ x: 0, y: 0 });

  // Constants for compact pill coordinate mapping
  const NODE_W = 190;
  const NODE_H = 64;
  const COL_GAP = 96;
  const ROW_GAP = 120;
  const LANE0_Y = 96;
  const LANE1_Y = LANE0_Y + ROW_GAP;
  const CANVAS_W = 6 * (NODE_W + COL_GAP) + NODE_W + 60;
  const CANVAS_H = LANE1_Y + NODE_H + 80;

  const getNodeXY = (p) => {
    const x = 30 + p.col * (NODE_W + COL_GAP);
    const y = p.lane === 0 ? LANE0_Y : LANE1_Y;
    return { x, y };
  };

  const isNodeUnlocked = (p) => {
    if (!p.deps || p.deps.length === 0) return true;
    return p.deps.every(depId => phaseState[depId] === 'done');
  };

  const handleMouseDown = (e) => {
    setDragActive(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setViewStart({ x: panX, y: panY });
  };

  const handleMouseMove = (e) => {
    if (!dragActive) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPanX(viewStart.x + dx);
    setPanY(viewStart.y + dy);
  };

  const handleMouseUp = () => {
    setDragActive(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(prev => Math.min(2, Math.max(0.5, prev + delta)));
  };

  const handleUpdateStatus = async (nodeId, currentStatus, isLocked) => {
    if (isLocked || updatingNode) return;

    let nextStatus = 'in_progress';
    if (currentStatus === 'in_progress') {
      nextStatus = 'done';
    } else if (currentStatus === 'done') {
      nextStatus = 'in_progress';
    }

    setUpdatingNode(nodeId);
    setErrorMsg('');
    try {
      await updatePhaseState(nodeId.toString(), nextStatus);
    } catch (err) {
      console.error('Error updating progress:', err);
      setErrorMsg(err.message || 'Failed to update database progress.');
    } finally {
      setUpdatingNode(null);
    }
  };

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Compiling SVG learning trees...</p>
        </div>
      </div>
    );
  }

  const candidates = ROADMAP_NODES.filter(p => phaseState[p.id] !== 'done' && isNodeUnlocked(p));
  candidates.sort((a, b) => (a.lane - b.lane) || (a.col - b.col));
  const currentId = candidates.length ? candidates[0].id : -1;

  const selectedNode = ROADMAP_NODES.find(p => p.id === selectedNodeId);
  const doneCount = ROADMAP_NODES.filter(p => phaseState[p.id] === 'done').length;

  return (
    <div className="fade-in" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="page-header scroll-reveal visible">
        <div className="page-title">
          <h1>Mastery Roadmap</h1>
          <p>Explore the DBMS dependency tree. Complete phases to unlock advanced branches.</p>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
          Progress: <strong>{doneCount} / {ROADMAP_NODES.length} Completed</strong>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* SVG Container */}
      <div className="flow-wrap scroll-reveal visible">
        <div className="flow-toolbar">
          <div className="flow-toolbar-left">
            <div className="flow-legend">
              <span className="lg-item"><span className="lg-swatch core"></span> Core Phase</span>
              <span className="lg-item"><span className="lg-swatch current"></span> Up Next</span>
              <span className="lg-item"><span className="lg-swatch done"></span> Completed</span>
              <span className="lg-item"><span className="lg-swatch optional"></span> Optional Branch</span>
              <span className="lg-item"><span className="lg-line"></span> Prereq Link</span>
            </div>
          </div>
          <div className="flow-zoom-controls">
            <button className="zoom-btn" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}>−</button>
            <span className="zoom-pct">{Math.round(zoom * 100)}%</span>
            <button className="zoom-btn" onClick={() => setZoom(prev => Math.min(2, prev + 0.15))}>+</button>
            <button className="zoom-btn" onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}>⤾</button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className={`flow-canvas-outer ${dragActive ? 'grabbing' : ''}`}
          style={{ height: '380px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
        >
          <svg 
            id="flowchart" 
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            width="100%"
            height="100%"
          >
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--border)" />
              </marker>
              <marker id="arrowhead-good" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--good)" />
              </marker>
              <marker id="arrowhead-accent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
              </marker>
            </defs>

            {/* Lane Labels + Dividers */}
            <line 
              x1={10} 
              x2={CANVAS_W - 10} 
              y1={LANE0_Y + NODE_H + (ROW_GAP - NODE_H) / 2} 
              y2={LANE0_Y + NODE_H + (ROW_GAP - NODE_H) / 2}
              className="lane-divider"
            />
            <text x={30} y={LANE0_Y - 18} className="lane-label">CORE TRACK — SEQUENTIAL</text>
            <text x={30} y={LANE1_Y - 18} className="lane-label">OPTIONAL BRANCH — PARALLEL-FRIENDLY</text>

            {/* Group wrapper for pan & zoom */}
            <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
              
              {/* Connection links */}
              {ROADMAP_NODES.map(p => {
                return p.deps.map(depId => {
                  const from = ROADMAP_NODES.find(ph => ph.id === depId);
                  const fromXY = getNodeXY(from);
                  const toXY = getNodeXY(p);
                  
                  // Connection points
                  const x1 = fromXY.x + NODE_W;
                  const y1 = fromXY.y + NODE_H / 2;
                  const x2 = toXY.x;
                  const y2 = toXY.y + NODE_H / 2;
                  const midX = (x1 + x2) / 2;
                  
                  const isDone = phaseState[depId] === 'done' && phaseState[p.id] === 'done';
                  const pathClass = `fc-edge ${p.optional || from.optional ? 'optional-edge' : ''} ${isDone ? 'done' : ''}`;
                  const marker = isDone ? 'url(#arrowhead-good)' : 'url(#arrowhead)';

                  return (
                    <g key={`link-${depId}-${p.id}`}>
                      {/* Background link line */}
                      <path
                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                        className={pathClass}
                        markerEnd={marker}
                        style={{ animationDelay: `${from.col * 0.3}s` }}
                      />
                      {/* Glowing data flow telemetry path */}
                      {isDone && (
                        <path
                          d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                          className="data-flow-path"
                        />
                      )}
                    </g>
                  );
                });
              })}

              {/* Start Flags */}
              {!phaseState[0] && (
                <g className="fc-flag start">
                  <rect 
                    className="flag-pill" 
                    height={20} 
                    rx={10} 
                    width={90}
                    x={30 + NODE_W / 2 - 45} 
                    y={LANE0_Y - 38}
                  />
                  <text 
                    className="flag-text" 
                    textAnchor="middle"
                    x={30 + NODE_W / 2} 
                    y={LANE0_Y - 25}
                  >
                    START HERE ↓
                  </text>
                </g>
              )}

              {/* You Are Here Flag */}
              {currentId >= 0 && (() => {
                const cur = ROADMAP_NODES.find(p => p.id === currentId);
                const { x, y } = getNodeXY(cur);
                return (
                  <g className="fc-flag here">
                    <rect 
                      className="flag-pill" 
                      height={20} 
                      rx={10} 
                      width={110}
                      x={x + NODE_W / 2 - 55} 
                      y={y - 38}
                    />
                    <text 
                      className="flag-text" 
                      textAnchor="middle"
                      x={x + NODE_W / 2} 
                      y={y - 25}
                    >
                      ● YOU ARE HERE
                    </text>
                  </g>
                );
              })()}

              {/* Pill shaped node milestones */}
              {ROADMAP_NODES.map(p => {
                const { x, y } = getNodeXY(p);
                const status = phaseState[p.id] || 'locked';
                const isCurrent = p.id === currentId;
                const done = status === 'done';
                const isSelected = selectedNodeId === p.id;
                
                let nodeClass = 'fc-node';
                if (p.optional) nodeClass += ' optional';
                if (done) nodeClass += ' done';
                if (isCurrent) nodeClass += ' current';
                if (isSelected) nodeClass += ' selected';

                return (
                  <g 
                    key={p.id} 
                    className={nodeClass}
                    onClick={() => setSelectedNodeId(selectedNodeId === p.id ? null : p.id)}
                    style={{ 
                      animation: 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards', 
                      animationDelay: `${p.col * 0.25}s`,
                      opacity: 0 
                    }}
                  >
                    {/* Glowing highlight pulse */}
                    {isCurrent && <circle className="fc-pulse" cx={x + NODE_W / 2} cy={y + NODE_H / 2} r={34} />}
                    
                    {/* Node Capsule */}
                    <rect className="fc-box" x={x} y={y} width={NODE_W} height={NODE_H} rx={12} />
                    
                    {/* Left side circle badge */}
                    <rect className="fc-badge-bg" x={x + 12} y={y + 12} width={40} height={40} rx={8} />
                    <text x={x + 32} y={y + 36} className="fc-code" textAnchor="middle" dominantBaseline="middle">
                      {p.code}
                    </text>

                    {/* Node Titles */}
                    {p.name.split(' ').map((word, wIdx, words) => {
                      const mid = Math.ceil(words.length / 2);
                      const line1 = words.slice(0, mid).join(' ');
                      const line2 = words.slice(mid).join(' ');
                      if (wIdx > 0 && wIdx !== mid) return null;
                      return (
                        <text 
                          key={wIdx} 
                          x={x + 64} 
                          y={y + 28 + (wIdx === 0 ? 0 : 14)} 
                          className="fc-title"
                          dominantBaseline="middle"
                        >
                          {wIdx === 0 ? line1 : line2}
                        </text>
                      );
                    })}

                    {/* Status Checkmark / Lock icon triggers */}
                    {done ? (
                      <text x={x + NODE_W - 20} y={y + 36} fill="var(--good)" fontSize="13" textAnchor="middle" dominantBaseline="middle">✓</text>
                    ) : (
                      !isNodeUnlocked(p) ? (
                        <text x={x + NODE_W - 20} y={y + 36} fill="var(--text-faint)" fontSize="11" textAnchor="middle" dominantBaseline="middle">🔒</text>
                      ) : (
                        <text x={x + NODE_W - 20} y={y + 36} fill="var(--accent)" fontSize="11" textAnchor="middle" dominantBaseline="middle">●</text>
                      )
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="flow-hint">Pinch or scroll to zoom · Click-drag to pan · Click any node for details</div>
        
        {/* Detail drawer */}
        <div className={`flow-detail ${selectedNode ? 'open' : ''}`}>
          {selectedNode && (
            <div className="flow-detail-inner" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              
              {/* Illustrative Diagram */}
              {getPhaseDiagram(selectedNode.code)}

              <div style={{ flexGrow: 1 }}>
                <div className="fd-top">
                  <div className="fd-title">
                    <span className="fd-code">{selectedNode.code}</span> {selectedNode.name}
                    {selectedNode.optional && <span className="fd-code" style={{ color: 'var(--purple)', borderColor: 'var(--purple)' }}>OPTIONAL</span>}
                  </div>
                  <div className="fd-time">{selectedNode.time}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--accent)', fontStyle: 'italic', marginBottom: '8px' }}>
                  &quot;{selectedNode.punchline}&quot;
                </div>
                <div className="fd-topics" style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                  <b>Topics:</b> {selectedNode.topics}
                </div>
                <div className="fd-deps" style={{ marginTop: '8px' }}>
                  {selectedNode.deps.length > 0 ? (
                    selectedNode.deps.map(depId => {
                      const dep = ROADMAP_NODES.find(ph => ph.id === depId);
                      return (
                        <span key={depId} className="dep-chip" style={{ fontSize: '11px', padding: '2px 8px' }}>
                          {phaseState[depId] === 'done' ? '✓' : '○'} {dep.code} {dep.name}
                        </span>
                      );
                    })
                  ) : (
                    <span className="dep-chip" style={{ fontSize: '11px', padding: '2px 8px' }}>No prerequisites</span>
                  )}
                </div>
                
                <div className="fd-actions" style={{ marginTop: '16px' }}>
                  <button 
                    className={`fd-btn mark-done ${phaseState[selectedNode.id] === 'done' ? 'is-done' : ''} ${!isNodeUnlocked(selectedNode) && phaseState[selectedNode.id] !== 'done' ? 'locked' : ''}`}
                    onClick={() => handleUpdateStatus(selectedNode.id, phaseState[selectedNode.id], !isNodeUnlocked(selectedNode))}
                    disabled={!isNodeUnlocked(selectedNode) && phaseState[selectedNode.id] !== 'done'}
                  >
                    {phaseState[selectedNode.id] === 'done' ? '✓ Marked complete' : (isNodeUnlocked(selectedNode) ? 'Mark phase complete' : 'Locked — finish prerequisites first')}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Roadmap;
