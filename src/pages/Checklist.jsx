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
      <div className="page-header scroll-reveal visible">
        <div className="page-title">
          <h1>Mastery Checklist</h1>
          <p>Self-assess your structural understanding of database engines. Be honest with yourself.</p>
        </div>
      </div>

      <div className="mastery-grid">
        {/* Left Side: Milestones List */}
        <div className="panel scroll-reveal visible">
          <div className="progress-summary" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div className="progress-num" style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{pct}<span>%</span></div>
            </div>
            <div style={{ flex: 1, marginLeft: '24px' }}>
              <div className="progress-bar-lg" style={{ height: '8px', background: 'var(--surface-3)', borderRadius: '4px', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', background: 'var(--accent)', width: `${pct}%`, transition: 'width 0.4s ease' }}></span>
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
                <div key={idx} className={`checklist-item ${isChecked ? 'checked' : ''}`} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <input
                    type="checkbox"
                    id={`chk-${idx}`}
                    checked={isChecked}
                    onChange={() => handleToggle(idx)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor={`chk-${idx}`} style={{ cursor: 'pointer', fontSize: '13.5px', color: isChecked ? 'var(--text-dim)' : 'var(--text)' }}>{milestone}</label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Books List */}
        <div className="panel scroll-reveal visible stagger-item-1" style={{ height: 'fit-content' }}>
          <h3>The five books, if you only get these</h3>
          <ul className="books-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {BOOKS.map((b, idx) => (
              <li key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <span className="b-title" style={{ fontSize: '13.5px', fontWeight: '600' }}>{b.title}</span>
                <span className="b-author" style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{b.author}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default Checklist;
