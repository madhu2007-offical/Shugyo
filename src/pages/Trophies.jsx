import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { calculateStreak } from '../utils/streakCalculator';
import { evaluateTrophies } from '../utils/trophyEvaluator';
import { TROPHIES, ROADMAP_NODES, MILESTONES, SQL_DRILLS } from '../data/trackerData';

export function Trophies() {
  const { user } = useAuth();
  
  const [progress, setProgress] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [grades, setGrades] = useState([]);
  const [streaks, setStreaks] = useState([]);
  const [testAttempts, setTestAttempts] = useState([]);
  
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
        const gradesPromise = supabase.from('question_grades').select('*').eq('user_id', user.id);
        const streakPromise = supabase.from('streaks').select('*').eq('user_id', user.id);
        const testPromise = supabase.from('test_attempts').select('*').eq('user_id', user.id);

        const [pRes, cRes, gRes, sRes, tRes] = await Promise.all([
          progressPromise,
          checklistPromise,
          gradesPromise,
          streakPromise,
          testPromise
        ]);

        if (pRes.error) throw pRes.error;
        if (cRes.error) throw cRes.error;
        if (gRes.error) throw gRes.error;
        if (sRes.error) throw sRes.error;
        if (tRes.error) throw tRes.error;

        setProgress(pRes.data || []);
        setChecklist(cRes.data || []);
        setGrades(gRes.data || []);
        setStreaks(sRes.data || []);
        setTestAttempts(tRes.data || []);
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
  const trophyStatus = evaluateTrophies({
    progress,
    checklistItems: checklist,
    questionGrades: grades,
    testAttempts,
    streakCount
  });
  const unlockedCount = Object.values(trophyStatus).filter(Boolean).length;

  // Custom progress mapper per badge card
  const getBadgeProgress = (id) => {
    switch (id) {
      case 'halfway':
        return {
          cur: progress.filter(p => !p.node_id.startsWith('drill_') && p.status === 'done').length,
          total: ROADMAP_NODES.length
        };
      case 'checklist-crusher':
        return {
          cur: checklist.filter(c => c.completed).length,
          total: MILESTONES.length
        };
      case 'query-whisperer':
        return {
          cur: progress.filter(p => p.node_id.startsWith('drill_') && p.status === 'done').length,
          total: 5
        };
      case 'sql-grandmaster':
        return {
          cur: progress.filter(p => p.node_id.startsWith('drill_') && p.status === 'done').length,
          total: SQL_DRILLS.length
        };
      case 'sharp-mind':
        return {
          cur: grades.length,
          total: 20
        };
      default:
        return null;
    }
  };

  const badgeIcons = {
    'first-steps': '🌱',
    'halfway': '🧭',
    'full-stack': '🏛️',
    'checklist-crusher': '✅',
    'query-whisperer': '🧩',
    'sql-grandmaster': '👑',
    'on-a-roll': '🔥',
    'unstoppable': '⚡',
    'iron-will': '🛡️',
    'sharp-mind': '🧠',
    'know-it-all': '🎯',
    'under-pressure': '⏱️',
    'fearless': '💀'
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Trophy Showcase</h1>
          <p>Locked achievements stay grayed out until you genuinely complete the requirements.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="badges-summary">
        <div className="badges-count">
          <b>{unlockedCount}</b> / {TROPHIES.length} unlocked
        </div>
      </div>

      <div className="badges-grid">
        {TROPHIES.map((t) => {
          const isUnlocked = !!trophyStatus[t.id];
          const icon = badgeIcons[t.id] || '🏆';
          const p = getBadgeProgress(t.id);

          return (
            <div key={t.id} className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <div className="badge-icon">
                {isUnlocked ? icon : '🔒'}
              </div>
              <div className="badge-name">{t.name}</div>
              <div className="badge-desc">{t.desc}</div>
              {p && (
                <div className="badge-progress">
                  {Math.min(p.cur, p.total)} / {p.total}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Trophies;
