import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { calculateStreak } from '../utils/streakCalculator';
import { evaluateAchievements } from '../utils/trophyEvaluator';
import { QUOTES, PRESSURE_QUOTES, TROPHIES, SQL_DRILLS, TEST_QUESTIONS } from '../data/trackerData';
import { BookOpen, CheckSquare, Award, Play } from 'lucide-react';
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

  // Evaluate achievements
  const achievementStatus = evaluateAchievements({
    progress,
    checklistItems: checklist,
    questionGrades: grades,
    testAttempts,
    streakCount
  });
  const unlockedAchievementCount = Object.values(achievementStatus).filter(Boolean).length;

  // 2. Leetcode-style statistics compilation
  // Easy total: 25 questions + 3 easy drills = 28
  // Medium total: 20 questions + 7 medium drills = 27
  // Hard/Advanced total: 15 questions + 19 advanced questions + 4 hard drills = 38
  const easyTotal = 28;
  const mediumTotal = 27;
  const hardTotal = 38;
  const grandTotal = easyTotal + mediumTotal + hardTotal;

  // Graded questions in grades: [{ question_id: "...", grade: "good"|"bad" }]
  const gradedKnownIds = grades.filter(g => g.grade === 'good').map(g => parseInt(g.question_id, 10));
  // Solved drills in progress: [{ node_id: "drill_0", status: "done" }]
  const solvedDrillIdxs = progress
    .filter(p => p.node_id.startsWith('drill_') && p.status === 'done')
    .map(p => parseInt(p.node_id.replace('drill_', ''), 10));

  let solvedEasy = 0;
  let solvedMedium = 0;
  let solvedHard = 0;

  // Calculate easy/medium/hard from test bank questions
  gradedKnownIds.forEach(qIdx => {
    const q = TEST_QUESTIONS[qIdx];
    if (q) {
      if (q.diff === 'easy') solvedEasy++;
      else if (q.diff === 'medium') solvedMedium++;
      else if (q.diff === 'hard' || q.diff === 'advanced') solvedHard++;
    }
  });

  // Calculate easy/medium/hard from drills
  solvedDrillIdxs.forEach(dIdx => {
    const d = SQL_DRILLS[dIdx];
    if (d) {
      if (d.difficulty === 'easy') solvedEasy++;
      else if (d.difficulty === 'medium') solvedMedium++;
      else if (d.difficulty === 'hard') solvedHard++;
    }
  });

  const solvedTotal = solvedEasy + solvedMedium + solvedHard;

  // Circular Stats SVG Ring calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((solvedTotal / grandTotal) * circumference);

  // 3. Deterministic Daily Challenge
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const dailyDrillIdx = dayOfYear % SQL_DRILLS.length;
  const dailyDrill = SQL_DRILLS[dailyDrillIdx];
  const isDailySolved = solvedDrillIdxs.includes(dailyDrillIdx);

  // 4. Heatmap calculations (LeetCode style submissions shades of green)
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

  // Count logs per date to assign LeetCode green intensity levels
  const logsPerDate = {};
  streaks.forEach(s => {
    logsPerDate[s.activity_date] = (logsPerDate[s.activity_date] || 0) + 1;
  });

  for (let i = 0; i < DAYS; i++) {
    const currentDay = new Date(startDay);
    currentDay.setDate(currentDay.getDate() + i);
    const key = toDateStr(currentDay);
    const count = logsPerDate[key] || 0;
    
    // Assign 4 intensity levels
    let intensityClass = '';
    if (count === 1) intensityClass = 'lvl1';
    else if (count === 2) intensityClass = 'lvl2';
    else if (count === 3) intensityClass = 'lvl3';
    else if (count >= 4) intensityClass = 'lvl4';

    heatmapCells.push({
      empty: false,
      date: key,
      count,
      intensityClass,
      isToday: key === todayKey
    });
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Mastery Console</h1>
          <p>LeetCode-style daily progress checks and DBMS achievements.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Hero section */}
      <section className="hero" style={{ padding: '0 0 20px 0' }}>
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

      {/* Leetcode and Daily Challenge Row */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* LeetCode Style Mastery Ring */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Mastery Progress</h3>
          <div className="lc-progress-panel">
            <div className="lc-circle-wrapper">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="none" 
                  stroke="var(--surface-3)" 
                  strokeWidth="8" 
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="none" 
                  stroke="var(--lc-easy)" 
                  strokeWidth="8" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="lc-circle-text">
                <span className="lc-circle-num">{solvedTotal}</span>
                <span className="lc-circle-sub">Solved / {grandTotal}</span>
              </div>
            </div>

            <div className="lc-bars-wrapper">
              <div className="lc-bar-row">
                <div className="lc-bar-header easy">
                  <span>Easy</span>
                  <span className="count">{solvedEasy}/{easyTotal}</span>
                </div>
                <div className="lc-bar-track">
                  <div className="lc-bar-fill easy" style={{ width: `${(solvedEasy / easyTotal) * 100}%` }}></div>
                </div>
              </div>

              <div className="lc-bar-row">
                <div className="lc-bar-header medium">
                  <span>Medium</span>
                  <span className="count">{solvedMedium}/{mediumTotal}</span>
                </div>
                <div className="lc-bar-track">
                  <div className="lc-bar-fill medium" style={{ width: `${(solvedMedium / mediumTotal) * 100}%` }}></div>
                </div>
              </div>

              <div className="lc-bar-row">
                <div className="lc-bar-header hard">
                  <span>Hard</span>
                  <span className="count">{solvedHard}/{hardTotal}</span>
                </div>
                <div className="lc-bar-track">
                  <div className="lc-bar-fill hard" style={{ width: `${(solvedHard / hardTotal) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Mastery Challenge Card */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--accent-line)', background: 'linear-gradient(145deg, var(--accent-soft) 0%, var(--surface) 60%)' }}>
          <div>
            <div className="pressure-eyebrow" style={{ color: 'var(--accent)', marginBottom: '8px' }}>
              <span className="pdot" style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></span> DAILY MASTERY CHALLENGE
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
              Q{dailyDrillIdx + 1}: {dailyDrill.topic}
            </h2>
            <div className="qcard-tags" style={{ marginBottom: '16px' }}>
              <span className={`difftag ${dailyDrill.difficulty}`}>{dailyDrill.difficulty.toUpperCase()}</span>
              <span className="qtag">SQL Drill</span>
              <span className="qtag">Today&apos;s Pick</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
              {dailyDrill.prompt}
            </p>
          </div>

          <div style={{ marginTop: '20px' }}>
            {isDailySolved ? (
              <div className="sql-status ok show" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                ✓ Completed Today
              </div>
            ) : (
              <Link to="/sql-drills" className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px', fontSize: '13px', padding: '10px 20px', background: 'var(--accent)', color: '#0A0B0D' }}>
                <Play size={14} fill="#0A0B0D" /> Solve Challenge
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
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
            <Award size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-val">{unlockedAchievementCount} / {TROPHIES.length}</span>
            <span className="stat-lbl">Achievements Unlocked</span>
          </div>
        </div>
      </div>

      {/* Consistency Section */}
      <div className="panel" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Submission Consistency
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
              {streaks.length} activity day{streaks.length === 1 ? '' : 's'} logged total
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
                      className={`hm-cell ${cell.intensityClass} ${cell.isToday ? 'today-cell' : ''}`}
                      title={`${cell.date}: ${cell.count} activity log${cell.count === 1 ? '' : 's'}`}
                      onClick={async () => {
                        try {
                          // Insert another log to build intensity
                          await supabase
                            .from('streaks')
                            .insert({ user_id: user.id, activity_date: cell.date });
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
              <span className="hm-cell lvl4"></span>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
