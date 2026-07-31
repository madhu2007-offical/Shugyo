import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { SQL_DRILLS, SQL_DRILLS_SCHEMA } from '../data/trackerData';
import { CheckCircle2, AlertTriangle, Terminal, Play, RotateCcw } from 'lucide-react';

export function SqlDrills() {
  const { user } = useAuth();
  
  const [activeDrill, setActiveDrill] = useState(SQL_DRILLS[0]);
  const [completedDrills, setCompletedDrills] = useState([]);
  
  const [userQuery, setUserQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  
  const [dbLoading, setDbLoading] = useState(true);
  const [runningQuery, setRunningQuery] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const dbRef = useRef(null);

  // 1. Initialize SQLite WASM db
  useEffect(() => {
    const initDb = async () => {
      setDbLoading(true);
      setErrorMsg('');
      try {
        if (!window.initSqlJs) {
          throw new Error('SQLite library (sql.js) is not loaded yet. Please refresh the page.');
        }

        const SQL = await window.initSqlJs({
          locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
        });

        const db = new SQL.Database();
        // Run schema definition and insert seed data
        db.run(SQL_DRILLS_SCHEMA);
        dbRef.current = db;
      } catch (err) {
        console.error('Failed to initialize SQLite database:', err);
        setErrorMsg(err.message || 'SQLite WASM compilation failed.');
      } finally {
        setDbLoading(false);
      }
    };

    initDb();

    return () => {
      if (dbRef.current) {
        dbRef.current.close();
      }
    };
  }, []);

  // 2. Fetch completed drills from Supabase progress table
  useEffect(() => {
    if (!user) return;

    const fetchCompletedDrills = async () => {
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('node_id')
          .eq('user_id', user.id)
          .eq('status', 'done')
          .like('node_id', 'drill_%');

        if (error) throw error;
        setCompletedDrills(data.map(item => item.node_id));
      } catch (err) {
        console.error('Error fetching completed drills:', err);
      }
    };

    fetchCompletedDrills();
  }, [user]);

  // Load drill template query
  useEffect(() => {
    if (activeDrill) {
      setUserQuery('-- Write your SQL query here\nSELECT * FROM employees;');
      setQueryResult(null);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [activeDrill]);

  const compareSQLResults = (res1, res2) => {
    if (!res1 || !res2 || res1.length === 0 || res2.length === 0) return false;
    const r1 = res1[0];
    const r2 = res2[0];

    if (r1.values.length !== r2.values.length) return false;
    if (r1.columns.length !== r2.columns.length) return false;

    // Helper to sort row representations for order-independent evaluation
    const stringifyRows = (rows) => 
      rows.map(row => row.map(cell => cell === null ? 'NULL' : cell.toString()).join('|'))
          .sort()
          .join('\n');

    return stringifyRows(r1.values) === stringifyRows(r2.values);
  };

  const handleRunQuery = () => {
    if (!dbRef.current) {
      setErrorMsg('Database is not initialized.');
      return;
    }

    setRunningQuery(true);
    setErrorMsg('');
    setSuccessMsg('');
    setQueryResult(null);

    try {
      // 1. Execute User query
      const userRes = dbRef.current.exec(userQuery);
      setQueryResult(userRes);

      // 2. Execute target validation query
      const targetRes = dbRef.current.exec(activeDrill.correctQuery);

      // 3. Compare outputs
      const isCorrect = compareSQLResults(userRes, targetRes);

      if (isCorrect) {
        setSuccessMsg('Perfect! Your query output matches the target output.');
        handleSaveCompletion();
      } else {
        setErrorMsg('Query executed successfully, but the output did not match the expected result.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'SQL compilation or syntax error.');
    } finally {
      setRunningQuery(false);
    }
  };

  const handleSaveCompletion = async () => {
    if (completedDrills.includes(activeDrill.id)) return;

    try {
      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          node_id: activeDrill.id,
          status: 'done',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,node_id'
        });

      if (error) throw error;

      setCompletedDrills(prev => [...prev, activeDrill.id]);
      await logActivity(user.id);
    } catch (err) {
      console.error('Error saving drill completion state:', err);
    }
  };

  const handleResetQuery = () => {
    setUserQuery('-- Write your SQL query here\nSELECT * FROM employees;');
    setQueryResult(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  if (dbLoading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Compiling SQLite WASM kernel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>SQL Drills</h1>
          <p>Practice writing queries inside an in-browser SQLite sandbox environment.</p>
        </div>
      </div>

      <div className="drills-layout">
        {/* Left Side: Drill Selector & Description */}
        <div className="drill-card">
          <h2>Select a Drill</h2>
          <div className="drill-list">
            {SQL_DRILLS.map((drill) => {
              const isCompleted = completedDrills.includes(drill.id);
              const isActive = activeDrill.id === drill.id;
              
              return (
                <button
                  key={drill.id}
                  className={`drill-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveDrill(drill)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{drill.title}</strong>
                  </span>
                  {isCompleted && (
                    <span style={{ color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      ✓ Mastered
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
            <h3 style={{ color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>Instructions</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{activeDrill.instructions}</p>
          </div>
        </div>

        {/* Right Side: SQL Sandbox Editor & Table results */}
        <div className="sandbox-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              <Terminal size={18} color="var(--color-secondary)" />
              SQLite Sandbox Editor
            </span>
            <button className="link-btn" onClick={handleResetQuery} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <textarea
            className="sql-textarea"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />

          <div>
            <button
              className="btn btn-primary accent-button btn-block"
              onClick={handleRunQuery}
              disabled={runningQuery}
            >
              <Play size={16} /> Run & Verify Query
            </button>
          </div>

          {errorMsg && (
            <div className="error-banner fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', background: 'rgba(57, 255, 20, 0.05)', border: '1px solid rgba(57, 255, 20, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Query Outputs */}
          {queryResult && queryResult.length > 0 && (
            <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
              <div className="schema-title">Output Table</div>
              <table className="query-results-table">
                <thead>
                  <tr>
                    {queryResult[0].columns.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult[0].values.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx}>{cell === null ? 'NULL' : cell.toString()}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Schema Browser info */}
          <div className="schema-browser">
            <div className="schema-title">Available Tables & Columns</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <strong>departments</strong> (id, name)
              <br />
              <strong>employees</strong> (id, name, department_id, salary, manager_id)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SqlDrills;
