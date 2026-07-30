import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { CHECKLIST_CATEGORIES } from '../data/trackerData';
import { Check } from 'lucide-react';

export function Checklist() {
  const { user } = useAuth();
  const [localChecked, setLocalChecked] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [syncStatus, setSyncStatus] = useState('Synced'); // Synced, Syncing..., Error

  // 1. Fetch initial checklist state
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

  // 2. Debounce and flush pending changes to Supabase
  useEffect(() => {
    if (Object.keys(pendingChanges).length === 0) return;

    setSyncStatus('Changes pending...');
    const delayDebounce = setTimeout(async () => {
      setSyncStatus('Saving to Supabase...');
      const changesToFlush = { ...pendingChanges };
      
      // Reset pending changes queue so new clicks during saving can start a new timer
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
        setErrorMsg('Some changes failed to save to the database. They will be retried on your next change.');
        // Put the failed changes back into the pending queue
        setPendingChanges(prev => ({
          ...changesToFlush,
          ...prev
        }));
      }
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [pendingChanges, user]);

  const handleToggle = (itemId) => {
    const currentVal = !!localChecked[itemId];
    const nextVal = !currentVal;

    // 1. Instantly update local UI
    setLocalChecked(prev => ({
      ...prev,
      [itemId]: nextVal
    }));

    // 2. Queue for database batch write
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
          <p>Syncing checklist index...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Mastery Checklist</h1>
          <p>Self-assess your structural understanding of database engines. Be honest with yourself.</p>
        </div>
        <div style={{ fontSize: '0.85rem', color: syncStatus === 'Synced' ? 'var(--color-success)' : syncStatus === 'Error saving' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
          Database Sync State: <strong>{syncStatus}</strong>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="checklist-container">
        {CHECKLIST_CATEGORIES.map((category) => {
          const checkedInCategory = category.items.filter(item => localChecked[item.id]).length;
          
          return (
            <div key={category.id} className="checklist-category-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0 }}>{category.title}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {checkedInCategory} / {category.items.length} Mastered
                </span>
              </div>
              
              <div className="checklist-items-list">
                {category.items.map((item) => {
                  const isChecked = !!localChecked[item.id];
                  return (
                    <div 
                      key={item.id} 
                      className={`checklist-row ${isChecked ? 'checked' : ''}`}
                      onClick={() => handleToggle(item.id)}
                    >
                      <div className="checkbox-custom">
                        {isChecked && <Check size={14} />}
                      </div>
                      <span className="checklist-text">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Checklist;
