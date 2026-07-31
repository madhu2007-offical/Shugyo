import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { MILESTONES, BOOKS } from '../data/trackerData';

export function Checklist() {
  const { user } = useAuth();
  
  const [localChecked, setLocalChecked] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [syncStatus, setSyncStatus] = useState('Synced');

  // 1. Fetch initial checklist state from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchChecklist = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const { data, error } = await supabase
          .from('checklist_items')
          .select('item_id, completed')
          .eq('user_id', user.id);

        if (error) throw error;

        const checkedMap = {};
        data.forEach(item => {
          checkedMap[item.item_id] = item.completed;
        });
        setLocalChecked(checkedMap);
      } catch (err) {
        console.error('Error fetching checklist:', err);
        setErrorMsg(err.message || 'Failed to load checklist items.');
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [user]);

  // 2. Debounce and flush changes to Supabase in batches
  useEffect(() => {
    if (Object.keys(pendingChanges).length === 0) return;

    setSyncStatus('Changes pending...');
    const delayDebounce = setTimeout(async () => {
      setSyncStatus('Saving...');
      const changesToFlush = { ...pendingChanges };
      setPendingChanges({});

      try {
        const upsertData = Object.entries(changesToFlush).map(([itemId, completed]) => ({
          user_id: user.id,
          item_id: itemId,
          completed,
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('checklist_items')
          .upsert(upsertData, { onConflict: 'user_id,item_id' });

        if (error) throw error;

        setSyncStatus('Synced');
        await logActivity(user.id);
      } catch (err) {
        console.error('Failed to sync checklist changes:', err);
        setSyncStatus('Error saving');
        setErrorMsg('Failed to sync some milestones. They will be retried on next change.');
        setPendingChanges(prev => ({
          ...changesToFlush,
          ...prev
        }));
      }
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [pendingChanges, user]);

  const handleToggle = (idx) => {
    const itemId = `milestone_${idx}`;
    const nextVal = !localChecked[itemId];

    setLocalChecked(prev => ({
      ...prev,
      [itemId]: nextVal
    }));

    setPendingChanges(prev => ({
      ...prev,
      [itemId]: nextVal
    }));
  };

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Syncing milestones...</p>
        </div>
      </div>
    );
  }

  const doneCount = MILESTONES.filter((_, idx) => localChecked[`milestone_${idx}`]).length;
  const pct = Math.round((doneCount / MILESTONES.length) * 100);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Mastery Checklist</h1>
          <p>Self-assess your structural understanding of database engines. Be honest with yourself.</p>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: syncStatus === 'Synced' ? 'var(--good)' : 'var(--warn)' }}>
          Sync: <strong>{syncStatus}</strong>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="mastery-grid">
        {/* Left Side: Milestones List */}
        <div className="panel">
          <div className="progress-summary">
            <div>
              <div className="progress-num">{pct}<span>%</span></div>
            </div>
            <div style={{ flex: 1, marginLeft: '24px' }}>
              <div className="progress-bar-lg">
                <span style={{ width: `${pct}%` }}></span>
              </div>
              <div className="streak-note" style={{ marginTop: '6px' }}>
                {doneCount} of {MILESTONES.length} milestones done
              </div>
            </div>
          </div>

          <h3>Milestones</h3>
          <div id="checklist">
            {MILESTONES.map((milestone, idx) => {
              const isChecked = !!localChecked[`milestone_${idx}`];
              return (
                <div key={idx} className={`checklist-item ${isChecked ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    id={`chk-${idx}`}
                    checked={isChecked}
                    onChange={() => handleToggle(idx)}
                  />
                  <label htmlFor={`chk-${idx}`}>{milestone}</label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Books List */}
        <div className="panel" style={{ height: 'fit-content' }}>
          <h3>The five books, if you only get these</h3>
          <ul className="books-list">
            {BOOKS.map((b, idx) => (
              <li key={idx}>
                <span className="b-title">{b.title}</span>
                <span className="b-author">{b.author}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default Checklist;
