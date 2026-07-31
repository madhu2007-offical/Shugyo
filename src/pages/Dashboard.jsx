import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { calculateStreak } from '../utils/streakCalculator';
import { evaluateTrophies } from '../utils/trophyEvaluator';
import { QUOTES, PRESSURE_QUOTES, TROPHIES } from '../data/trackerData';
import { BookOpen, CheckSquare, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  
  const [progress, setProgress] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [grades, setGrades] = useState([]);
  const [streaks, setStreaks] = useState([]);
  const [testAttempts, setTestAttempts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Rotating quote indices
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [pressureIdx, setPressureIdx] = useState(0);

  // 1. Fetch all data from Supabase
  const fetchAllData = async () => {
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
      console.error('Error loading dashboard data:', err);
      setErrorMsg(err.message || 'Failed to load tracking data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Quote rotation intervals
  useEffect(() => {
    const qTimer = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % QUOTES.length);
    }, 6000);
    const pTimer = setInterval(() => {
      setPressureIdx(prev => (prev + 1) % PRESSURE_QUOTES.length);
    }, 5000);

    return () => {
      clearInterval(qTimer);
      clearInterval(pTimer);
    };
  }, []);

  const toDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleToggleToday = async () => {
    if (!user) return;
    const todayStr = toDateStr(new Date());
    const isDoneToday = streaks.some(s => s.activity_date === todayStr);

    try {
      if (isDoneToday) {
        // Delete today's streak
        const { error } = await supabase
          .from('streaks')
          .delete()
          .eq('user_id', user.id)
          .eq('activity_date', todayStr);
        if (error) throw error;
      } else {
        // Log today's streak
        await logActivity(user.id);
      }
      // Re-fetch streaks data
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      setStreaks(data || []);
    } catch (err) {
      console.error('Error toggling today streak:', err);
    }
  };

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Syncing database session...</p>
        </div>
      </div>
    );
  }

  // Derive counts
  const completedPhasesCount = progress.filter(p => !p.node_id.startsWith('drill_') && p.status === 'done').length;
  const completedChecklistCount = checklist.filter(c => c.completed).length;
  const streakCount = calculateStreak(streaks);
  
  // Calculate longest streak
  const sortedStreakDates = Array.from(new Set(streaks.map(s => s.activity_date))).sort();
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate = null;
  sortedStreakDates.forEach(ds => {
    const d = new Date(ds + 'T00:00:00');
    if (prevDate) {
      const diff = Math.round((d - prevDate) / 86400000);
      currentRun = (diff === 1) ? currentRun + 1 : 1;
    } else {
      currentRun = 1;
    }
    longestStreak = Math.max(longestStreak, currentRun);
    prevDate = d;
  });

  // Evaluate Trophies
  const trophyStatus = evaluateTrophies({
    progress,
    checklistItems: checklist,
    questionGrades: grades,
    testAttempts,
    streakCount
  });
  const unlockedTrophyCount = Object.values(trophyStatus).filter(Boolean).length;

  // Heatmap calculations
  const todayKey = toDateStr(new Date());
  const isDoneToday = streaks.some(s => s.activity_date === todayKey);
  const DAYS = 119;
  const heatmapCells = [];
  const startDay = new Date();
  startDay.setDate(startDay.getDate() - (DAYS - 1));
  const startDow = startDay.getDay();

  // Add empty filler cells for alignment
  for (let i = 0; i < startDow; i++) {
    heatmapCells.push({ empty: true, id: `filler-${i}` });
  }

  for (let i = 0; i < DAYS; i++) {
    const currentDay = new Date(startDay);
    currentDay.setDate(currentDay.getDate() + i);
    const key = toDateStr(currentDay);
    const hasLog = streaks.some(s => s.activity_date === key);
    heatmapCells.push({
      empty: false,
      date: key,
      hasLog,
      isToday: key === todayKey
    });
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Mastery Console</h1>
          <p>Database-backed mastery metrics and consecutive daily streaks.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Hero section */}
      <section className="hero" style={{ padding: '0 0 30px 0' }}>
        <div className="eyebrow">
          <span className="dot"></span> PERSONAL CONSOLE · BASIC → ADVANCED
        </div>
        <h1 className="hero-title" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
          Stop memorizing SQL. <span style={{ color: 'var(--accent)' }}>Start understanding the engine.</span>
        </h1>
        <p className="hero-sub" style={{ fontSize: '15px', marginTop: '10px' }}>
          A self-paced mastery track through relational theory, storage internals, concurrency, and distributed systems. 
          All progress is securely synchronized to your Supabase account.
        </p>

        <div className="quote-box" style={{ marginTop: '24px' }}>
          <div className="quote-text">{QUOTES[quoteIdx].text}</div>
          <div className="quote-author">— {QUOTES[quoteIdx].author}</div>
        </div>
      </section>

      {/* Reality Check Pressure Banner */}
      <div className="pressure-banner" style={{ marginBottom: '24px' }}>
        <div className="pressure-inner">
          <div className="pressure-quote-wrap">
            <div className="pressure-eyebrow">
              <span className="pdot"></span> REALITY CHECK
            </div>
            <div className="pressure-quote">
              {PRESSURE_QUOTES[pressureIdx]}
            </div>
          </div>
          <div className="pressure-cta">
            <Link to="/roadmap" className="start-now-btn">
              🚀 View Roadmap
            </Link>
            <div className="pressure-subtext">P0 · Foundations — 1–2 weeks</div>
          </div>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <BookOpen size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-val">{completedPhasesCount} / 9</span>
            <span className="stat-lbl">Roadmap Phases</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <CheckSquare size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-val">{completedChecklistCount} / 10</span>
            <span className="stat-lbl">Milestones Done</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pink">
            <Trophy size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-val">{unlockedTrophyCount} / {TROPHIES.length}</span>
            <span className="stat-lbl">Trophies Unlocked</span>
          </div>
        </div>
      </div>

      {/* Consistency Section */}
      <div className="panel" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Consistency Tracker
        </h3>
        <div className="streak-grid">
          <div>
            <div className="streak-numbers">
              <div className="streak-num-block">
                <div className="streak-big">
                  <span className="flame">🔥</span>
                  <span>{streakCount}</span>
                </div>
                <div className="streak-cap">CURRENT STREAK (DAYS)</div>
              </div>
              <div className="streak-num-block">
                <div className="streak-big">
                  <span>{longestStreak}</span>
                </div>
                <div className="streak-cap">LONGEST STREAK</div>
              </div>
            </div>
            <button 
              className={`today-btn ${isDoneToday ? 'done' : ''}`}
              onClick={handleToggleToday}
            >
              {isDoneToday ? '✓ Done today' : 'Mark today done'}
            </button>
            <div className="pressure-subtext" style={{ marginTop: '16px' }}>
              {streaks.length} day{streaks.length === 1 ? '' : 's'} logged total
            </div>
          </div>
          
          <div>
            <div className="heatmap-wrap">
              <div className="heatmap">
                {heatmapCells.map((cell) => {
                  if (cell.empty) {
                    return <div key={cell.id} className="hm-cell" style={{ visibility: 'hidden' }} />;
                  }
                  return (
                    <div 
                      key={cell.date} 
                      className={`hm-cell ${cell.hasLog ? 'lvl2' : ''} ${cell.isToday ? 'today-cell' : ''}`}
                      title={`${cell.date}${cell.hasLog ? ' — done ✓' : ''}`}
                      onClick={async () => {
                        try {
                          if (cell.hasLog) {
                            await supabase
                              .from('streaks')
                              .delete()
                              .eq('user_id', user.id)
                              .eq('activity_date', cell.date);
                          } else {
                            await supabase
                              .from('streaks')
                              .insert({ user_id: user.id, activity_date: cell.date });
                          }
                          // Refresh data
                          const { data } = await supabase
                            .from('streaks')
                            .select('*')
                            .eq('user_id', user.id);
                          setStreaks(data || []);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="heatmap-legend">
              <span>Less</span>
              <span className="hm-cell"></span>
              <span className="hm-cell lvl1"></span>
              <span className="hm-cell lvl2"></span>
              <span className="hm-cell lvl3"></span>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
