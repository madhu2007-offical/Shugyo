import { useProgress } from '../context/ProgressContext';
import { MILESTONES, BOOKS } from '../data/trackerData';

export function Checklist() {
  const { loading, checklistState, toggleChecklistItem } = useProgress();

  const handleToggle = async (idx) => {
    const itemId = `milestone_${idx}`;
    await toggleChecklistItem(itemId);
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

  const doneCount = MILESTONES.filter((_, idx) => checklistState.includes(`milestone_${idx}`)).length;
  const pct = Math.round((doneCount / MILESTONES.length) * 100);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Mastery Checklist</h1>
          <p>Self-assess your structural understanding of database engines. Be honest with yourself.</p>
        </div>
      </div>

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
              <div className="streak-note" style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>
                {doneCount} of {MILESTONES.length} milestones done
              </div>
            </div>
          </div>

          <h3>Milestones</h3>
          <div id="checklist">
            {MILESTONES.map((milestone, idx) => {
              const isChecked = checklistState.includes(`milestone_${idx}`);
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
