import { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { calculateStreak } from '../utils/streakCalculator';
import { evaluateAchievements } from '../utils/trophyEvaluator';
import { QUOTES, PRESSURE_QUOTES, TROPHIES, SQL_DRILLS, TEST_QUESTIONS } from '../data/trackerData';
import { BookOpen, CheckSquare, Award, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { 
    loading,
    phaseState, 
    checklistState, 
    gradeState, 
    streakDays, 
    sqlSolved, 
    examCount, 
    toggleStreakDay 
  } = useProgress();

  // Rotating quote indices
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [pressureIdx, setPressureIdx] = useState(0);

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
    const todayStr = toDateStr(new Date());
    await toggleStreakDay(todayStr);
  };

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Loading DBMS master console...</p>
        </div>
      </div>
    );
  }

  // Map state to what metrics calculators expect
  const progressList = [
    ...Object.entries(phaseState).map(([nodeId, status]) => ({ node_id: nodeId, status })),
    ...sqlSolved.map(drillIdx => ({ node_id: `drill_${drillIdx}`, status: 'done' }))
  ];

  const checklistList = checklistState.map(itemId => ({ item_id: itemId, completed: true }));
  const questionGradesList = Object.entries(gradeState).map(([qId, grade]) => ({ question_id: qId, grade }));
  const testAttemptsList = Array(examCount).fill({ test_id: 'exam_mode' });

  // Derive counts
  const completedPhasesCount = Object.values(phaseState).filter(status => status === 'done').length;
  const completedChecklistCount = checklistState.length;
  
  // Format streaks for streak calculator
  const streakObjects = streakDays.map(day => ({ activity_date: day }));
  const streakCount = calculateStreak(streakObjects);
  
  // Calculate longest streak
  const sortedStreakDates = [...streakDays].sort();
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
    progress: progressList,
    checklistItems: checklistList,
    questionGrades: questionGradesList,
    testAttempts: testAttemptsList,
    streakCount
  });
  const unlockedAchievementCount = Object.values(achievementStatus).filter(Boolean).length;

  // 2. Leetcode-style statistics compilation
  const easyTotal = 28;
  const mediumTotal = 27;
  const hardTotal = 38;
  const grandTotal = easyTotal + mediumTotal + hardTotal;

  // Easy / Medium / Hard Solved calculation
  let solvedEasy = 0;
  let solvedMedium = 0;
  let solvedHard = 0;

  // Process Solved Questions
  questionGradesList.forEach(item => {
    if (item.grade === 'good') {
      const q = TEST_QUESTIONS[parseInt(item.question_id, 10)];
      if (q) {
        if (q.diff === 'easy') solvedEasy++;
        else if (q.diff === 'medium') solvedMedium++;
        else if (q.diff === 'hard' || q.diff === 'advanced') solvedHard++;
      }
    }
  });

  // Process Solved SQL Drills
  sqlSolved.forEach(drillIdx => {
    const d = SQL_DRILLS[drillIdx];
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
  const dailyDrillIdx = dayOfYearIndex() % SQL_DRILLS.length;
  const dailyDrill = SQL_DRILLS[dailyDrillIdx];
  const isDailySolved = sqlSolved.includes(dailyDrillIdx);

  // 4. Heatmap calculations (LeetCode style submissions shades of green)
  const todayKey = toDateStr(new Date());
  const isDoneToday = streakDays.includes(todayKey);
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
    const hasLog = streakDays.includes(key);
    
    // Simple active/inactive mapping for single-user JSONB streaks
    let intensityClass = '';
    if (hasLog) intensityClass = 'lvl4';

    heatmapCells.push({
      empty: false,
      date: key,
      hasLog,
      intensityClass,
      isToday: key === todayKey
    });
  }

  function dayOfYearIndex() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Mastery Console</h1>
          <p>LeetCode-style daily progress checks and DBMS achievements.</p>
        </div>
      </div>



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
              <svg width="90" height="90" viewBox="0 0 120 120">
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
        <div className="daily-challenge-box">
          <div>
            <div className="challenge-eyebrow">DAILY MASTERY CHALLENGE</div>
            <h2 className="challenge-title">
              Q{dailyDrillIdx + 1}: {dailyDrill.topic}
            </h2>
            <div className="qcard-tags" style={{ marginBottom: '12px' }}>
              <span className={`difftag ${dailyDrill.difficulty}`}>{dailyDrill.difficulty.toUpperCase()}</span>
              <span className="qtag">SQL Drill</span>
              <span className="qtag">Today&apos;s Pick</span>
            </div>
            <p className="challenge-prompt">
              {dailyDrill.prompt}
            </p>
          </div>

          <div style={{ marginTop: '20px' }}>
            {isDailySolved ? (
              <div className="sql-status ok show" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                ✓ Completed Today
              </div>
            ) : (
              <Link to="/sql-drills" className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px', fontSize: '13px', padding: '8px 16px', background: 'var(--accent)', color: '#fff' }}>
                <Play size={14} fill="#fff" stroke="#fff" /> Solve Challenge
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
              {streakDays.length} activity day{streakDays.length === 1 ? '' : 's'} logged total
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
                      title={`${cell.date}: ${cell.hasLog ? '1 active log' : '0 logs'}`}
                      onClick={async () => {
                        await toggleStreakDay(cell.date);
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
