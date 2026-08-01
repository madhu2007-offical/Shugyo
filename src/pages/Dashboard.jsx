import { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { calculateStreak } from '../utils/streakCalculator';
import { evaluateAchievements } from '../utils/trophyEvaluator';
import { QUOTES, PRESSURE_QUOTES, TROPHIES, SQL_DRILLS, TEST_QUESTIONS } from '../data/trackerData';
import { BookOpen, CheckSquare, Award, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

function useCountUp(endVal, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(endVal, 10);
    if (isNaN(end) || end === 0) {
      setCount(0);
      return;
    }
    const totalTicks = 30;
    const stepTime = Math.abs(Math.floor(duration / totalTicks));
    const increment = Math.ceil(end / totalTicks);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [endVal, duration]);
  return count;
}



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

  const [quoteIdx, setQuoteIdx] = useState(0);
  const [pressureIdx, setPressureIdx] = useState(0);



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

  const progressList = [
    ...Object.entries(phaseState).map(([nodeId, status]) => ({ node_id: nodeId, status })),
    ...sqlSolved.map(drillIdx => ({ node_id: `drill_${drillIdx}`, status: 'done' }))
  ];
  const checklistList = checklistState.map(itemId => ({ item_id: itemId, completed: true }));
  const questionGradesList = Object.entries(gradeState).map(([qId, grade]) => ({ question_id: qId, grade }));
  const testAttemptsList = Array(examCount).fill({ test_id: 'exam_mode' });

  const rawPhasesCount = Object.values(phaseState).filter(status => status === 'done').length;
  const rawChecklistCount = checklistState.length;
  
  const streakObjects = streakDays.map(day => ({ activity_date: day }));
  const streakCountRaw = calculateStreak(streakObjects);
  
  const sortedStreakDates = [...streakDays].sort();
  let rawLongestStreak = 0;
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
    rawLongestStreak = Math.max(rawLongestStreak, currentRun);
    prevDate = d;
  });

  const achievementStatus = evaluateAchievements({
    progress: progressList,
    checklistItems: checklistList,
    questionGrades: questionGradesList,
    testAttempts: testAttemptsList,
    streakCount: streakCountRaw
  });
  const rawAchievementCount = Object.values(achievementStatus).filter(Boolean).length;

  const easyTotal = 28;
  const mediumTotal = 27;
  const hardTotal = 38;
  const grandTotal = easyTotal + mediumTotal + hardTotal;

  let rawSolvedEasy = 0;
  let rawSolvedMedium = 0;
  let rawSolvedHard = 0;

  questionGradesList.forEach(item => {
    if (item.grade === 'good') {
      const q = TEST_QUESTIONS[parseInt(item.question_id, 10)];
      if (q) {
        if (q.diff === 'easy') rawSolvedEasy++;
        else if (q.diff === 'medium') rawSolvedMedium++;
        else if (q.diff === 'hard' || q.diff === 'advanced') rawSolvedHard++;
      }
    }
  });

  sqlSolved.forEach(drillIdx => {
    const d = SQL_DRILLS[drillIdx];
    if (d) {
      if (d.difficulty === 'easy') rawSolvedEasy++;
      else if (d.difficulty === 'medium') rawSolvedMedium++;
      else if (d.difficulty === 'hard') rawSolvedHard++;
    }
  });

  const rawSolvedTotal = rawSolvedEasy + rawSolvedMedium + rawSolvedHard;

  const completedPhasesCount = useCountUp(rawPhasesCount);
  const completedChecklistCount = useCountUp(rawChecklistCount);
  const streakCount = useCountUp(streakCountRaw);
  const longestStreak = useCountUp(rawLongestStreak);
  const unlockedAchievementCount = useCountUp(rawAchievementCount);
  const solvedEasy = useCountUp(rawSolvedEasy);
  const solvedMedium = useCountUp(rawSolvedMedium);
  const solvedHard = useCountUp(rawSolvedHard);
  const solvedTotal = useCountUp(rawSolvedTotal);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((solvedTotal / grandTotal) * circumference);

  const dailyDrillIdx = dayOfYearIndex() % SQL_DRILLS.length;
  const dailyDrill = SQL_DRILLS[dailyDrillIdx];
  const isDailySolved = sqlSolved.includes(dailyDrillIdx);

  const todayKey = toDateStr(new Date());
  const isDoneToday = streakDays.includes(todayKey);
  const DAYS = 119;
  const heatmapCells = [];
  const startDay = new Date();
  startDay.setDate(startDay.getDate() - (DAYS - 1));
  const startDow = startDay.getDay();

  for (let i = 0; i < startDow; i++) {
    heatmapCells.push({ empty: true, id: `filler-${i}` });
  }

  for (let i = 0; i < DAYS; i++) {
    const currentDay = new Date(startDay);
    currentDay.setDate(currentDay.getDate() + i);
    const key = toDateStr(currentDay);
    const hasLog = streakDays.includes(key);
    
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

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Mastery Console</h1>
          <p>LeetCode-style daily progress checks and DBMS achievements.</p>
        </div>
      </div>

      {/* Hero section with clean, static dark gradient mesh */}
      <section 
        className="hero" 
        style={{ 
          padding: '2.5rem', 
          borderRadius: 'var(--radius)', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, var(--surface) 100%)', 
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="eyebrow">
            <span className="dot"></span> PERSONAL CONSOLE · BASIC → ADVANCED
          </div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
            Stop memorizing SQL. <span style={{ color: 'var(--accent)' }}>Start understanding the engine.</span>
          </h1>
          <p className="hero-sub" style={{ fontSize: '15px', marginTop: '10px', color: 'var(--text-dim)' }}>
            A self-paced mastery track through relational theory, storage internals, concurrency, and distributed systems. 
            All progress is securely synchronized to your Supabase account.
          </p>

          <div className="quote-box" style={{ marginTop: '24px' }}>
            <div className="quote-text">{QUOTES[quoteIdx].text}</div>
            <div className="quote-author">— {QUOTES[quoteIdx].author}</div>
          </div>

          {/* 3. Animated Hero SVG Diagram (Static query scanning B+ Tree details) */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <svg width="460" height="90" viewBox="0 0 460 90" style={{ background: 'rgba(9, 11, 15, 0.6)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
              <g className="fade-scale-node" style={{ animationDelay: '0.2s' }}>
                <rect x="15" y="25" width="80" height="36" rx="4" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1" />
                <text x="55" y="47" textAnchor="middle" fill="var(--text)" fontSize="8.5" fontFamily="var(--font-mono)">SELECT *</text>
              </g>
              
              <path d="M 95 43 L 155 43" className="draw-path-line" style={{ stroke: 'var(--accent)', strokeWidth: '1.2', fill: 'none' }} />
              
              <g className="fade-scale-node" style={{ animationDelay: '0.8s' }}>
                <rect x="155" y="25" width="110" height="36" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1" />
                <text x="210" y="47" textAnchor="middle" fill="var(--text)" fontSize="8.5" fontFamily="var(--font-mono)">B+ TREE INDEX</text>
              </g>
              
              <circle cx="210" cy="43" r="3.5" fill="var(--good)">
                <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
              </circle>
              
              <path d="M 265 43 L 325 43" className="draw-path-line" style={{ stroke: 'var(--accent)', strokeWidth: '1.2', fill: 'none' }} />
              
              <g className="fade-scale-node" style={{ animationDelay: '1.4s' }}>
                <rect x="325" y="25" width="120" height="36" rx="4" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1" />
                <text x="385" y="42" textAnchor="middle" fill="var(--text)" fontSize="8" fontFamily="var(--font-mono)">STORAGE PAGE</text>
                <text x="385" y="52" textAnchor="middle" fill="var(--good)" fontSize="7" fontFamily="var(--font-mono)">[ 1 row / 0.2ms ]</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Reality Check Pressure Banner */}
      <div className="pressure-banner" style={{ marginBottom: '24px' }}>
        <div className="pressure-inner" style={{ transition: 'background-color 0.8s ease' }}>
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
                  stroke="var(--accent)" 
                  strokeWidth="8" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="lc-circle-text">
                {/* 5. Animated Counter stats triggers */}
                <span className="lc-circle-num motion-counter" data-target={rawSolvedTotal}>{solvedTotal}</span>
                <span className="lc-circle-sub">Solved / {grandTotal}</span>
              </div>
            </div>

            <div className="lc-bars-wrapper">
              <div className="lc-bar-row">
                <div className="lc-bar-header easy">
                  <span>Easy</span>
                  <span className="count motion-counter" data-target={rawSolvedEasy} data-suffix={`/${easyTotal}`}>{solvedEasy}/{easyTotal}</span>
                </div>
                <div className="lc-bar-track">
                  <div className="lc-bar-fill easy" style={{ width: `${(solvedEasy / easyTotal) * 100}%` }}></div>
                </div>
              </div>

              <div className="lc-bar-row">
                <div className="lc-bar-header medium">
                  <span>Medium</span>
                  <span className="count motion-counter" data-target={rawSolvedMedium} data-suffix={`/${mediumTotal}`}>{solvedMedium}/{mediumTotal}</span>
                </div>
                <div className="lc-bar-track">
                  <div className="lc-bar-fill medium" style={{ width: `${(solvedMedium / mediumTotal) * 100}%` }}></div>
                </div>
              </div>

              <div className="lc-bar-row">
                <div className="lc-bar-header hard">
                  <span>Hard</span>
                  <span className="count motion-counter" data-target={rawSolvedHard} data-suffix={`/${hardTotal}`}>{solvedHard}/{hardTotal}</span>
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
      <div className="dashboard-grid reveal">
        <div className="stat-card">
          <div className="stat-icon purple">
            <BookOpen size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-val motion-counter" data-target={rawPhasesCount} data-suffix=" / 9">{completedPhasesCount} / 9</span>
            <span className="stat-lbl">Roadmap Phases</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <CheckSquare size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-val motion-counter" data-target={rawChecklistCount} data-suffix=" / 10">{completedChecklistCount} / 10</span>
            <span className="stat-lbl">Milestones Done</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pink">
            <Award size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-val motion-counter" data-target={rawAchievementCount} data-suffix={` / ${TROPHIES.length}`}>{unlockedAchievementCount} / {TROPHIES.length}</span>
            <span className="stat-lbl">Achievements Unlocked</span>
          </div>
        </div>
      </div>

      {/* Consistency Section */}
      <div className="panel reveal" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Submission Consistency
        </h3>
        <div className="streak-grid">
          <div>
            <div className="streak-numbers">
              <div className="streak-num-block">
                <div className="streak-big">
                  <span style={{ fontSize: '24px', marginRight: '4px' }}>🔥</span>
                  <span className="motion-counter" data-target={streakCountRaw}>{streakCount}</span>
                </div>
                <div className="streak-cap">CURRENT STREAK (DAYS)</div>
              </div>
              <div className="streak-num-block">
                <div className="streak-big">
                  <span className="motion-counter" data-target={rawLongestStreak}>{longestStreak}</span>
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
