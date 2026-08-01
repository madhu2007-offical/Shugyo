import { useProgress } from '../context/ProgressContext';
import { calculateStreak } from '../utils/streakCalculator';
import { evaluateAchievements } from '../utils/trophyEvaluator';
import { TROPHIES, ROADMAP_NODES, MILESTONES, SQL_DRILLS } from '../data/trackerData';

export function Trophies() {
  const { 
    loading, 
    phaseState, 
    checklistState, 
    gradeState, 
    streakDays, 
    sqlSolved, 
    examCount 
  } = useProgress();

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

  // Construct lists for badge evaluator
  const progressList = [
    ...Object.entries(phaseState).map(([nodeId, status]) => ({ node_id: nodeId, status })),
    ...sqlSolved.map(drillIdx => ({ node_id: `drill_${drillIdx}`, status: 'done' }))
  ];
  const checklistList = checklistState.map(itemId => ({ item_id: itemId, completed: true }));
  const questionGradesList = Object.entries(gradeState).map(([qId, grade]) => ({ question_id: qId, grade }));
  const testAttemptsList = Array(examCount).fill({ test_id: 'exam_mode' });

  const streakCount = calculateStreak(streakDays.map(day => ({ activity_date: day })));
  const achievementStatus = evaluateAchievements({
    progress: progressList,
    checklistItems: checklistList,
    questionGrades: questionGradesList,
    testAttempts: testAttemptsList,
    streakCount
  });
  const unlockedCount = Object.values(achievementStatus).filter(Boolean).length;

  // Custom progress mapper per badge card
  const getBadgeProgress = (id) => {
    switch (id) {
      case 'halfway':
        return {
          cur: Object.values(phaseState).filter(status => status === 'done').length,
          total: ROADMAP_NODES.length
        };
      case 'checklist-crusher':
        return {
          cur: checklistState.length,
          total: MILESTONES.length
        };
      case 'query-whisperer':
        return {
          cur: sqlSolved.length,
          total: 5
        };
      case 'sql-grandmaster':
        return {
          cur: sqlSolved.length,
          total: SQL_DRILLS.length
        };
      case 'sharp-mind':
        return {
          cur: questionGradesList.length,
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
          <h1>Achievements Case</h1>
          <p>Locked achievements stay grayed out until you genuinely complete the requirements.</p>
        </div>
      </div>

      <div className="badges-summary">
        <div className="badges-count">
          <b>{unlockedCount}</b> / {TROPHIES.length} unlocked
        </div>
      </div>

      <div className="badges-grid">
        {TROPHIES.map((t) => {
          const isUnlocked = !!achievementStatus[t.id];
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
