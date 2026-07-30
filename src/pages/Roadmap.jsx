import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { ROADMAP_NODES } from '../data/trackerData';
import { Lock, Check, Play, HelpCircle } from 'lucide-react';

export function Roadmap() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingNode, setUpdatingNode] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('node_id, status')
          .eq('user_id', user.id);

        if (error) throw error;

        // Map progress data to key-value object: { node_id: status }
        const progressMap = {};
        data.forEach(item => {
          progressMap[item.node_id] = item.status;
        });
        setProgress(progressMap);
      } catch (err) {
        console.error('Error fetching roadmap progress:', err);
        setErrorMsg(err.message || 'Failed to load progress from database.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const handleUpdateStatus = async (nodeId, currentStatus, isLocked) => {
    if (isLocked || updatingNode) return;

    let nextStatus = 'in_progress';
    if (currentStatus === 'in_progress') {
      nextStatus = 'done';
    } else if (currentStatus === 'done') {
      nextStatus = 'in_progress'; // Toggle back to in_progress
    }

    setUpdatingNode(nodeId);
    setErrorMsg('');
    try {
      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          node_id: nodeId,
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

      // Log activity to streaks whenever user updates a node
      await logActivity(user.id);
    } catch (err) {
      console.error('Error updating progress:', err);
      setErrorMsg(err.message || 'Failed to update database progress.');
    } finally {
      setUpdatingNode(null);
    }
  };

  const getLockState = (node) => {
    if (!node.deps || node.deps.length === 0) return false; // No dependencies -> unlocked
    // Locked if ANY dependency is not 'done'
    return node.deps.some(depId => progress[depId] !== 'done');
  };

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Mapping database learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Mastery Roadmap</h1>
          <p>Explore the DBMS knowledge dependency graph. Complete topics to unlock next steps.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="roadmap-container">
        {/* We present a styled grid grouped by dependencies or level of depth */}
        <div className="dashboard-grid">
          {ROADMAP_NODES.map((node) => {
            const status = progress[node.id] || 'locked';
            const isLocked = getLockState(node);
            const displayStatus = isLocked ? 'locked' : status;

            let cardClass = 'roadmap-node';
            let icon = <HelpCircle size={20} />;

            if (isLocked) {
              cardClass += ' locked';
              icon = <Lock size={20} className="text-dark" />;
            } else if (displayStatus === 'in_progress') {
              cardClass += ' in_progress';
              icon = <Play size={20} style={{ color: 'var(--color-primary)' }} />;
            } else if (displayStatus === 'done') {
              cardClass += ' done';
              icon = <Check size={20} style={{ color: 'var(--color-success)' }} />;
            } else {
              cardClass += ' ready'; // Ready to start
              icon = <HelpCircle size={20} style={{ color: 'var(--text-muted)' }} />;
            }

            return (
              <div 
                key={node.id} 
                className={cardClass}
                onClick={() => handleUpdateStatus(node.id, progress[node.id], isLocked)}
              >
                <div className="node-status-badge">
                  {icon}
                </div>
                <h3 className="node-name">{node.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{node.description}</p>
                {node.deps.length > 0 && (
                  <div className="node-deps">
                    Requires: {node.deps.map(d => ROADMAP_NODES.find(n => n.id === d)?.name).join(', ')}
                  </div>
                )}
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: isLocked ? 'var(--text-dark)' : displayStatus === 'done' ? 'var(--color-success)' : displayStatus === 'in_progress' ? 'var(--color-primary)' : 'var(--text-muted)'
                  }}>
                    {isLocked ? 'Locked' : displayStatus === 'done' ? 'Mastered' : displayStatus === 'in_progress' ? 'In Progress' : 'Start Training'}
                  </span>
                  {updatingNode === node.id && (
                    <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1px' }}></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default Roadmap;
