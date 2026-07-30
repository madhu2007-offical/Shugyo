import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { calculateStreak } from '../utils/streakCalculator';
import { evaluateTrophies } from '../utils/trophyEvaluator';
import { TROPHIES } from '../data/trackerData';
import { Award, Lock, Sparkles, CheckCircle } from 'lucide-react';

export function Trophies() {
  const { user } = useAuth();
  
  const [progress, setProgress] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [tests, setTests] = useState([]);
  const [streaks, setStreaks] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const progressPromise = supabase.from('progress').select('*').eq('user_id', user.id);
        const checklistPromise = supabase.from('checklist_items').select('*').eq('user_id', user.id);
        const testPromise = supabase.from('test_attempts').select('*').eq('user_id', user.id);
        const streakPromise = supabase.from('streaks').select('*').eq('user_id', user.id);

        const [progressRes, checklistRes, testRes, streakRes] = await Promise.all([
          progressPromise,
          checklistPromise,
          testPromise,
          streakPromise
        ]);

        if (progressRes.error) throw progressRes.error;
        if (checklistRes.error) throw checklistRes.error;
        if (testRes.error) throw testRes.error;
        if (streakRes.error) throw streakRes.error;

        setProgress(progressRes.data || []);
        setChecklist(checklistRes.data || []);
        setTests(testRes.data || []);
        setStreaks(streakRes.data || []);
      } catch (err) {
        console.error('Error fetching trophies metrics:', err);
        setErrorMsg(err.message || 'Failed to calculate trophy states.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Evaluating achievements...</p>
        </div>
      </div>
    );
  }

  const streakCount = calculateStreak(streaks);
  const trophyStatus = evaluateTrophies({ progress, checklistItems: checklist, testAttempts: tests, streakCount });
  const unlockedCount = Object.values(trophyStatus).filter(Boolean).length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Trophy Showcase</h1>
          <p>Your accomplishments earned during database training.</p>
        </div>
        <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '0.5rem 1rem', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600' }}>
          Completed: {unlockedCount} / {TROPHIES.length} Trophies
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="section-card">
        <div className="trophy-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {TROPHIES.map((t) => {
            const isUnlocked = !!trophyStatus[t.id];
            
            return (
              <div 
                key={t.id} 
                className={`trophy-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                style={{ 
                  padding: '2rem', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  height: '100%',
                  borderWidth: '1px',
                  background: isUnlocked ? 'rgba(0, 240, 255, 0.02)' : 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <Award size={48} className="trophy-icon" style={{ marginBottom: '0.25rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{t.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.desc}</p>
                </div>
                
                <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  {isUnlocked ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                      <CheckCircle size={14} /> Unlocked
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-dark)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                      <Lock size={14} /> Locked
                    </span>
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
export default Trophies;
