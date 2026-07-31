import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { SQL_DRILLS, SQL_DRILLS_SCHEMA } from '../data/trackerData';

export function SqlDrills() {
  const { user } = useAuth();
  
  const [completedDrills, setCompletedDrills] = useState([]);
  const [activeDrillIdx, setActiveDrillIdx] = useState(0);
  const [queryInput, setQueryInput] = useState('');
  
  const [queryResult, setQueryResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusText, setStatusText] = useState('');
  const [statusClass, setStatusClass] = useState('');
  const [dbReady, setDbReady] = useState(false);

  // 1. Initialize Alasql schema
  useEffect(() => {
    try {
      if (!window.alasql) {
        throw new Error('Alasql library is loading...');
      }
      
      // Clear any pre-existing tables to re-initialize cleanly
      window.alasql('DROP TABLE IF EXISTS employees');
      window.alasql('DROP TABLE IF EXISTS departments');
      window.alasql('DROP TABLE IF EXISTS customers');
      window.alasql('DROP TABLE IF EXISTS orders');

      // Execute SQL Seed script
      window.alasql(SQL_DRILLS_SCHEMA);
      setDbReady(true);
    } catch (err) {
      console.error('Alasql initialization error:', err);
      setErrorMsg('Failed to launch in-browser SQL compiler.');
    }
  }, []);

  // 2. Fetch completed drills from Supabase
  const fetchCompletedDrills = async () => {
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('node_id')
        .eq('user_id', user.id)
        .eq('status', 'done')
        .like('node_id', 'drill_%');

      if (error) throw error;
      setCompletedDrills(data.map(item => parseInt(item.node_id.replace('drill_', ''), 10)));
    } catch (err) {
      console.error('Error fetching completed drills:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompletedDrills();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle drill change
  const handleSelectDrill = (idx) => {
    setActiveDrillIdx(idx);
    setQueryInput('-- write your SQL here\n');
    setQueryResult(null);
    setErrorMsg('');
    setSuccessMsg('');
    setStatusText('');
    setStatusClass('');
  };

  const normalizeRows = (rows, keepOrder) => {
    if (!Array.isArray(rows)) return null;
    const norm = rows.map(r => {
      const sorted = {};
      Object.keys(r).sort().forEach(k => {
        let v = r[k];
        if (typeof v === 'number') v = Math.round(v * 100) / 100;
        sorted[k] = v;
      });
      return JSON.stringify(sorted);
    });
    return keepOrder ? norm : norm.slice().sort();
  };

  const resultsMatch = (a, b, keepOrder) => {
    const na = normalizeRows(a, keepOrder);
    const nb = normalizeRows(b, keepOrder);
    if (!na || !nb) return false;
    if (na.length !== nb.length) return false;
    return na.every((v, i) => v === nb[i]);
  };

  const handleRunQuery = async () => {
    if (!dbReady || !window.alasql) return;
    
    setQueryResult(null);
    setErrorMsg('');
    setSuccessMsg('');
    setStatusText('');
    setStatusClass('');

    const drill = SQL_DRILLS[activeDrillIdx];
    let userRows;

    try {
      userRows = window.alasql(queryInput);
    } catch (err) {
      setStatusText('⚠ Query error');
      setStatusClass('fail');
      setErrorMsg(err.message || String(err));
      return;
    }

    if (!Array.isArray(userRows)) {
      setStatusText('⚠ Not a SELECT');
      setStatusClass('error');
      setErrorMsg("This ran, but didn't return rows — make sure you're writing a SELECT query.");
      return;
    }

    setQueryResult(userRows);

    try {
      // Execute the model query to compare
      const modelRows = window.alasql(drill.solution);
      const isCorrect = resultsMatch(userRows, modelRows, drill.checkOrder);

      if (isCorrect) {
        setStatusText('✓ Matches expected output');
        setStatusClass('ok');
        setSuccessMsg('Perfect! Your query results match the target results.');
        
        // Sync progress state to Supabase
        await handleSaveCompletion(activeDrillIdx);
      } else {
        setStatusText("✗ Doesn't match yet");
        setStatusClass('fail');
        setErrorMsg("Query ran successfully, but the output rows didn't match the expected result.");
      }
    } catch (err) {
      console.error(err);
      setStatusText('⚠ Match check error');
      setStatusClass('error');
    }
  };

  const handleSaveCompletion = async (drillIdx) => {
    if (completedDrills.includes(drillIdx)) return;

    try {
      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          node_id: `drill_${drillIdx}`,
          status: 'done',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,node_id'
        });

      if (error) throw error;

      setCompletedDrills(prev => [...prev, drillIdx]);
      await logActivity(user.id);
    } catch (err) {
      console.error('Error saving SQL completion state:', err);
    }
  };

  const activeDrill = SQL_DRILLS[activeDrillIdx];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>SQL Drills</h1>
          <p>Practice writing queries against a small sample database with a real-time output validation check.</p>
        </div>
      </div>

      {/* Schema Box */}
      <div className="sql-schema">
        <b>employees</b>(emp_id, name, dept_id, salary, manager_id, hire_date) · <b>departments</b>(dept_id, dept_name, budget) · <b>customers</b>(customer_id, name, city) · <b>orders</b>(order_id, customer_id, emp_id, order_date, amount) — 10 employees, 4 departments, 6 customers, and 10 orders loaded.
      </div>

      <div className="streak-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Left Side: Drill Select */}
        <div className="panel" style={{ height: 'fit-content', maxHeight: '600px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>Select a Drill</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SQL_DRILLS.map((drill, idx) => {
              const isCompleted = completedDrills.includes(idx);
              const isActive = activeDrillIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDrill(idx)}
                  className={`btn btn-block ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'space-between', textAlign: 'left', padding: '10px 15px' }}
                >
                  <span style={{ fontSize: '13px' }}>Q{idx + 1}. {drill.topic}</span>
                  {isCompleted && <span style={{ color: 'var(--good)', fontSize: '11px' }}>✓ Solved</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active drill query console */}
        <div className="sql-card" style={{ margin: 0 }}>
          <div className="sql-card-top">
            <div className="qcard-tags">
              <span className={`difftag ${activeDrill.difficulty}`}>
                {activeDrill.difficulty.charAt(0).toUpperCase() + activeDrill.difficulty.slice(1)}
              </span>
            </div>
            <span className="qnum">
              {completedDrills.includes(activeDrillIdx) && <span className="sql-solved-pill">✓ Solved</span>}
              Q{activeDrillIdx + 1} / {SQL_DRILLS.length}
            </span>
          </div>

          <div className="sql-prompt" style={{ fontWeight: '500' }}>
            {activeDrill.prompt}
          </div>

          <div className="sql-editor">
            <div className="sql-editor-bar">
              <span style={{ background: '#F27878' }}></span>
              <span style={{ background: '#F2B84B' }}></span>
              <span style={{ background: '#79E2A6' }}></span>
              <span className="dot-label">query_{activeDrillIdx + 1}.sql</span>
            </div>
            <div className="sql-editor-body">
              <textarea
                className="sql-editor-textarea"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                spellCheck="false"
              />
            </div>
            <div className="sql-editor-actions">
              <button 
                className="sql-run-btn"
                onClick={handleRunQuery}
              >
                ▶ Run Query
              </button>
              
              <span className={`sql-status show ${statusClass}`}>
                {statusText}
              </span>

              <button 
                className="sql-reset-btn"
                onClick={() => {
                  setQueryInput('-- write your SQL here\n');
                  setQueryResult(null);
                  setErrorMsg('');
                  setSuccessMsg('');
                  setStatusText('');
                  setStatusClass('');
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="sql-output fade-in">
              <div className="sql-output-error">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="sql-output fade-in" style={{ color: 'var(--good)', background: 'var(--good-soft)', border: '1px solid var(--good)', padding: '12px 14px', borderRadius: '8px', fontSize: '13px' }}>
              {successMsg}
            </div>
          )}

          {/* Result Row Table */}
          {queryResult && queryResult.length > 0 && (
            <div className="sql-output fade-in">
              <div className="sql-output-label">RESULT</div>
              <div className="sql-output-table-wrap">
                <table className="sql-output-table">
                  <thead>
                    <tr>
                      {Object.keys(queryResult[0]).map((col, cIdx) => (
                        <th key={cIdx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.slice(0, 20).map((row, rIdx) => (
                      <tr key={rIdx}>
                        {Object.keys(queryResult[0]).map((col, cIdx) => (
                          <td key={cIdx}>
                            {row[col] === null || row[col] === undefined ? 'NULL' : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sql-row-count">
                {queryResult.length} row{queryResult.length === 1 ? '' : 's'} returned
                {queryResult.length > 20 ? ' (showing first 20)' : ''}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default SqlDrills;
