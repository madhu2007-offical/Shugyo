import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { ROADMAP_NODES } from '../data/trackerData';

export function Roadmap() {
  const { user } = useAuth();
  
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  
  const [updatingNode, setUpdatingNode] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Dragging state
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const viewStart = useRef({ x: 0, y: 0 });

  // 1. Fetch initial progress from Supabase
  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('node_id, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = {};
      data.forEach(item => {
        progressMap[item.node_id] = item.status;
      });
      setProgress(progressMap);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setErrorMsg('Failed to load roadmap progress from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Constants for coordinate mapping
  const NODE_W = 168;
  const NODE_H = 88;
  const COL_GAP = 96;
  const ROW_GAP = 130;
  const LANE0_Y = 96;
  const LANE1_Y = LANE0_Y + ROW_GAP;
  const CANVAS_W = 6 * (NODE_W + COL_GAP) + NODE_W + 60;
  const CANVAS_H = LANE1_Y + NODE_H + 80;

  const getNodeXY = (p) => {
    const x = 30 + p.col * (NODE_W + COL_GAP);
    const y = p.lane === 0 ? LANE0_Y : LANE1_Y;
    return { x, y };
  };

  // Helper to determine unlocked state
  const isNodeUnlocked = (p) => {
    if (!p.deps || p.deps.length === 0) return true;
    return p.deps.every(depId => progress[depId] === 'done');
  };

  // Dragging event handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    viewStart.current = { x: panX, y: panY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanX(viewStart.current.x + dx);
    setPanY(viewStart.current.y + dy);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
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
      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          node_id: nodeId.toString(),
          status: nextStatus,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,node_id'
        });

      if (error) throw error;

      // Update state locally
      setProgress(prev => ({
        ...prev,
        [nodeId]: nextStatus
      }));

      await logActivity(user.id);
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

  // Determine current node (first unlocked-but-not-done node)
  const candidates = ROADMAP_NODES.filter(p => progress[p.id] !== 'done' && isNodeUnlocked(p));
  candidates.sort((a, b) => (a.lane - b.lane) || (a.col - b.col));
  const currentId = candidates.length ? candidates[0].id : -1;

  // Selected node details
  const selectedNode = ROADMAP_NODES.find(p => p.id === selectedNodeId);
  const doneCount = ROADMAP_NODES.filter(p => progress[p.id] === 'done').length;

  return (
    <div className="fade-in" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="page-header">
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
      <div className="flow-wrap">
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
          className="flow-canvas-outer"
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
              
              {/* Edges/Paths */}
              {ROADMAP_NODES.map(p => {
                return p.deps.map(depId => {
                  const from = ROADMAP_NODES.find(ph => ph.id === depId);
                  const fromXY = getNodeXY(from);
                  const toXY = getNodeXY(p);
                  const x1 = fromXY.x + NODE_W;
                  const y1 = fromXY.y + NODE_H / 2;
                  const x2 = toXY.x;
                  const y2 = toXY.y + NODE_H / 2;
                  const midX = (x1 + x2) / 2;
                  
                  const isDone = progress[depId] === 'done' && progress[p.id] === 'done';
                  const pathClass = `fc-edge ${p.optional || from.optional ? 'optional-edge' : ''} ${isDone ? 'done' : ''}`;
                  const marker = isDone ? 'url(#arrowhead-good)' : 'url(#arrowhead)';

                  return (
                    <path
                      key={`edge-${depId}-${p.id}`}
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      className={pathClass}
                      markerEnd={marker}
                    />
                  );
                });
              })}

              {/* Start Flags */}
              {!progress[0] && (
                <g className="fc-flag start">
                  <rect 
                    className="flag-pill" 
                    height={22} 
                    rx={11} 
                    width={100}
                    x={30 + NODE_W / 2 - 50} 
                    y={LANE0_Y - 42}
                  />
                  <text 
                    className="flag-text" 
                    textAnchor="middle"
                    x={30 + NODE_W / 2} 
                    y={LANE0_Y - 28}
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
                      height={22} 
                      rx={11} 
                      width={120}
                      x={x + NODE_W / 2 - 60} 
                      y={y - 42}
                    />
                    <text 
                      className="flag-text" 
                      textAnchor="middle"
                      x={x + NODE_W / 2} 
                      y={y - 28}
                    >
                      ● YOU ARE HERE
                    </text>
                  </g>
                );
              })()}

              {/* Nodes */}
              {ROADMAP_NODES.map(p => {
                const { x, y } = getNodeXY(p);
                const status = progress[p.id] || 'locked';
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
                  >
                    <circle className="fc-pulse" cx={x + NODE_W / 2} cy={y + NODE_H / 2} r={34} />
                    <rect className="fc-box" x={x} y={y} width={NODE_W} height={NODE_H} rx={12} />
                    <text x={x + 14} y={y + 20} className="fc-code">{p.code}{p.optional ? ' · OPT' : ''}</text>
                    
                    {/* Render split title lines */}
                    {p.name.split(' ').map((word, wIdx, words) => {
                      const mid = Math.ceil(words.length / 2);
                      const line1 = words.slice(0, mid).join(' ');
                      const line2 = words.slice(mid).join(' ');
                      if (wIdx > 0 && wIdx !== mid) return null;
                      return (
                        <text 
                          key={wIdx} 
                          x={x + 14} 
                          y={y + 40 + (wIdx === 0 ? 0 : 16)} 
                          className="fc-title"
                        >
                          {wIdx === 0 ? line1 : line2}
                        </text>
                      );
                    })}

                    <text x={x + 14} y={y + NODE_H - 12} className="fc-time" fill="var(--text-faint)">{p.time}</text>
                    <text x={x + NODE_W - 22} y={y + 20} className="fc-check" fill="var(--good)" fontSize="13">✓</text>
                    <text x={x + NODE_W - 12} y={y + 20} className="fc-badge-current" fill="var(--accent)" fontSize="12" textAnchor="end">●</text>
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
            <div className="flow-detail-inner">
              <div className="fd-top">
                <div className="fd-title">
                  <span className="fd-code">{selectedNode.code}</span> {selectedNode.name}
                  {selectedNode.optional && <span className="fd-code" style={{ color: 'var(--purple)', borderColor: 'var(--purple)' }}>OPTIONAL</span>}
                </div>
                <div className="fd-time">{selectedNode.time}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--accent)', fontStyle: 'italic', marginBottom: '14px' }}>
                &quot;{selectedNode.punchline}&quot;
              </div>
              <div className="fd-topics">
                <b>Topics:</b> {selectedNode.topics}
              </div>
              <div className="fd-deps">
                {selectedNode.deps.length > 0 ? (
                  selectedNode.deps.map(depId => {
                    const dep = ROADMAP_NODES.find(ph => ph.id === depId);
                    return (
                      <span key={depId} className="dep-chip">
                        {progress[depId] === 'done' ? '✓' : '○'} {dep.code} {dep.name}
                      </span>
                    );
                  })
                ) : (
                  <span className="dep-chip">No prerequisites</span>
                )}
              </div>
              
              <div className="fd-actions">
                <button 
                  className={`fd-btn mark-done ${progress[selectedNode.id] === 'done' ? 'is-done' : ''} ${!isNodeUnlocked(selectedNode) && progress[selectedNode.id] !== 'done' ? 'locked' : ''}`}
                  onClick={() => handleUpdateStatus(selectedNode.id, progress[selectedNode.id], !isNodeUnlocked(selectedNode))}
                  disabled={!isNodeUnlocked(selectedNode) && progress[selectedNode.id] !== 'done'}
                >
                  {progress[selectedNode.id] === 'done' ? '✓ Marked complete' : (isNodeUnlocked(selectedNode) ? 'Mark phase complete' : 'Locked — finish prerequisites first')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Roadmap;
