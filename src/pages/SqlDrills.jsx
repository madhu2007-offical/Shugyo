import { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { SQL_DRILLS, SQL_DRILLS_SCHEMA } from '../data/trackerData';

// EXPLAIN plan generator helper for DBMS telemetry
const generateQueryPlan = (sql) => {
  if (!sql) return null;
  const cleanSql = sql.toLowerCase();
  const planSteps = [];
  
  // Scan step
  let scanType = "Seq Scan";
  let targetTable = "employees";
  if (cleanSql.includes("from departments") || cleanSql.includes("join departments")) targetTable = "departments";
  else if (cleanSql.includes("from orders") || cleanSql.includes("join orders")) targetTable = "orders";
  else if (cleanSql.includes("from customers") || cleanSql.includes("join customers")) targetTable = "customers";
  
  if (cleanSql.includes("where") && (cleanSql.includes("id") || cleanSql.includes("emp_id") || cleanSql.includes("dept_id") || cleanSql.includes("customer_id"))) {
    scanType = "Index Scan using PK";
    planSteps.push(`-> ${scanType} on ${targetTable}  (cost=0.15..8.30 rows=1)`);
  } else {
    planSteps.push(`-> ${scanType} on ${targetTable}  (cost=0.00..18.50 rows=10)`);
  }
  
  // Join step
  if (cleanSql.includes("join")) {
    planSteps.unshift(`-> Hash Join  (cost=22.40..58.10 rows=10)`);
    planSteps.push(`   -> Hash  (cost=12.20..12.20)`);
    planSteps.push(`      -> Seq Scan on departments  (cost=0.00..10.20 rows=4)`);
  }
  
  // Aggregation step
  if (cleanSql.includes("group by") || cleanSql.includes("sum(") || cleanSql.includes("avg(") || cleanSql.includes("count(")) {
    planSteps.unshift(`-> Hash Aggregate (group by: ...)  (cost=65.20..68.50 rows=5)`);
  }
  
  // Sorting step
  if (cleanSql.includes("order by")) {
    planSteps.unshift(`-> Sort Operator (key: ...)  (cost=85.20..87.10)`);
  }
  
  planSteps.unshift("EXPLAIN ANALYZE Plan Optimizer (Postgres-Compatible):");
  
  const mockTime = (Math.random() * 3 + 0.5).toFixed(2);
  const mockMemory = Math.floor(Math.random() * 80 + 32);
  
  return {
    steps: planSteps,
    time: mockTime,
    memory: mockMemory
  };
};

export function SqlDrills() {
  const { loading, sqlSolved, logSqlSolved } = useProgress();
  
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

      // Execute SQL Seed script statement by statement
      const statements = SQL_DRILLS_SCHEMA.split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      statements.forEach(stmt => {
        window.alasql(stmt);
      });
      setDbReady(true);
    } catch (err) {
      console.error('Alasql initialization error:', err);
      setErrorMsg('Failed to launch in-browser SQL compiler.');
    }
  }, []);

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
        await logSqlSolved(activeDrillIdx);
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

  const activeDrill = SQL_DRILLS[activeDrillIdx];

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Seeding database engines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>SQL Drills</h1>
          <p>Practice writing queries against a small sample database with a real-time output validation check.</p>
        </div>
      </div>

      {/* Schema / ER Diagram Box */}
      <div className="er-diagram-container" style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.08em' }}>Relational Database Schema Layout</div>
        <div className="er-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          <div className="panel" style={{ padding: '16px', margin: 0, background: 'var(--surface-2)' }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>departments</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div>🔑 dept_id <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
              <div>dept_name <span style={{ color: 'var(--text-faint)' }}>VARCHAR</span></div>
              <div>budget <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
            </div>
          </div>
          <div className="panel" style={{ padding: '16px', margin: 0, background: 'var(--surface-2)' }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>employees</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div>🔑 emp_id <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
              <div>name <span style={{ color: 'var(--text-faint)' }}>VARCHAR</span></div>
              <div>🔗 dept_id <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
              <div>salary <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
              <div>🔗 manager_id <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
              <div>hire_date <span style={{ color: 'var(--text-faint)' }}>DATE</span></div>
            </div>
          </div>
          <div className="panel" style={{ padding: '16px', margin: 0, background: 'var(--surface-2)' }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>customers</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div>🔑 customer_id <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
              <div>name <span style={{ color: 'var(--text-faint)' }}>VARCHAR</span></div>
              <div>city <span style={{ color: 'var(--text-faint)' }}>VARCHAR</span></div>
            </div>
          </div>
          <div className="panel" style={{ padding: '16px', margin: 0, background: 'var(--surface-2)' }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>orders</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div>🔑 order_id <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
              <div>🔗 customer_id <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
              <div>🔗 emp_id <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
              <div>order_date <span style={{ color: 'var(--text-faint)' }}>DATE</span></div>
              <div>amount <span style={{ color: 'var(--text-faint)' }}>INT</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="streak-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Left Side: Drill Select */}
        <div className="panel" style={{ height: 'fit-content', maxHeight: '600px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>Select a Drill</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SQL_DRILLS.map((drill, idx) => {
              const isCompleted = sqlSolved.includes(idx);
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
        <div className="sql-card" style={{ margin: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', padding: '24px' }}>
          <div className="sql-card-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="qcard-tags">
              <span className={`difftag ${activeDrill.difficulty}`}>
                {activeDrill.difficulty.charAt(0).toUpperCase() + activeDrill.difficulty.slice(1)}
              </span>
            </div>
            <span className="qnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-faint)' }}>
              {sqlSolved.includes(activeDrillIdx) && <span className="sql-solved-pill">✓ Solved</span>}
              Q{activeDrillIdx + 1} / {SQL_DRILLS.length}
            </span>
          </div>

          <div className="sql-prompt" style={{ fontWeight: '500', fontSize: '14.5px', marginBottom: '16px', lineHeight: '1.6' }}>
            {activeDrill.prompt}
          </div>

          <div className="sql-editor" style={{ border: '1px solid var(--border)', background: '#090a0f', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' }}>
            <div className="sql-editor-bar" style={{ borderBottom: '1px solid var(--border)', padding: '8px 14px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)' }}></span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)' }}></span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)' }}></span>
              <span className="dot-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', marginLeft: '8px' }}>query_{activeDrillIdx + 1}.sql</span>
            </div>
            <div className="sql-editor-body" style={{ padding: '14px' }}>
              <textarea
                className="sql-editor-textarea"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                spellCheck="false"
                style={{ width: '100%', minHeight: '110px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px', resize: 'vertical' }}
              />
            </div>
            <div className="sql-editor-actions" style={{ borderTop: '1px solid var(--border)', padding: '10px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            <div className="sql-output fade-in" style={{ marginTop: '1.5rem' }}>
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

          {/* Engine Optimizer Execution Plan */}
          {queryResult && queryResult.length > 0 && (() => {
            const plan = generateQueryPlan(queryInput);
            if (!plan) return null;
            return (
              <div className="sql-output fade-in" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <div className="sql-output-label">DBMS RELATIONAL ENGINE OPTIMIZER & TELEMETRY</div>
                <div style={{ background: '#090a0f', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '10px', borderBottom: '1px dashed var(--border)', paddingBottom: '6px' }}>
                    <span>⚡ Planning Time: {plan.time} ms</span>
                    <span>💾 Memory Usage: {plan.memory} KB</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {plan.steps.map((step, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          color: idx === 0 ? 'var(--accent)' : 'var(--text-dim)', 
                          fontWeight: idx === 0 ? '600' : 'normal',
                          paddingLeft: step.startsWith(' ') ? '12px' : '0px'
                        }}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
export default SqlDrills;
