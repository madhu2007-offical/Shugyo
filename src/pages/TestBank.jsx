import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { TEST_QUESTIONS } from '../data/trackerData';

export function TestBank() {
  const { user } = useAuth();
  
  // Graded questions state (stored in Supabase question_grades table)
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filtering and Shuffling State
  const [sourceFilter, setSourceFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [questionOrder, setQuestionOrder] = useState([]);
  
  // Revealed answers state (local ui state)
  const [revealedIds, setRevealedIds] = useState({});

  // Exam Mode State
  const [examActive, setExamActive] = useState(false);
  const [examConfigOpen, setExamConfigOpen] = useState(false);
  const [examCount, setExamCount] = useState(15);
  const [examTime, setExamTime] = useState(20); // minutes
  const [examQuestions, setExamQuestions] = useState([]);
  const [examCurrentIdx, setExamCurrentIdx] = useState(0);
  const [examTimeRemaining, setExamTimeRemaining] = useState(0);
  const [examTimerInterval, setExamTimerInterval] = useState(null);
  const [examFinished, setExamFinished] = useState(false);
  const [examTimeUsed, setExamTimeUsed] = useState(0);

  // 1. Fetch historical question grades from Supabase
  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('question_grades')
        .select('question_id, grade')
        .eq('user_id', user.id);

      if (error) throw error;

      const gradeMap = {};
      data.forEach(item => {
        gradeMap[item.question_id] = item.grade;
      });
      setGrades(gradeMap);
    } catch (err) {
      console.error('Error fetching question grades:', err);
      setErrorMsg('Failed to load graded questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGrades();
    }
    // Initialize default order
    setQuestionOrder(TEST_QUESTIONS.map((_, idx) => idx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle shuffling
  const handleShuffle = () => {
    const arr = [...questionOrder];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setQuestionOrder(arr);
    setRevealedIds({});
  };

  const handleResetFilters = () => {
    setSourceFilter('all');
    setDiffFilter('all');
    setQuestionOrder(TEST_QUESTIONS.map((_, idx) => idx));
    setRevealedIds({});
  };

  // Grade operation
  const handleGrade = async (qIdx, gradeType) => {
    try {
      const { error } = await supabase
        .from('question_grades')
        .upsert({
          user_id: user.id,
          question_id: qIdx,
          grade: gradeType,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,question_id'
        });

      if (error) throw error;

      // Update state locally
      setGrades(prev => ({
        ...prev,
        [qIdx]: gradeType
      }));

      await logActivity(user.id);
    } catch (err) {
      console.error('Error saving grade:', err);
      setErrorMsg('Failed to sync grade to the database.');
    }
  };

  // Exam Mode mechanics
  const handleStartExam = () => {
    const total = TEST_QUESTIONS.length;
    const count = examCount === 'all' ? total : Math.min(examCount, total);
    
    // Shuffle all questions and select subset
    const shuffledPool = TEST_QUESTIONS.map((_, idx) => idx);
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }

    const selectedQList = shuffledPool.slice(0, count);
    setExamQuestions(selectedQList);
    setExamCurrentIdx(0);
    setExamTimeRemaining(examTime * 60);
    setExamFinished(false);
    setExamActive(true);
    setExamConfigOpen(false);

    // Start timer interval
    if (examTimerInterval) clearInterval(examTimerInterval);
    const interval = setInterval(() => {
      setExamTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setExamActive(false);
          setExamFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setExamTimerInterval(interval);
  };

  const handleQuitExam = () => {
    if (window.confirm('Quit this exam? Grades on this attempt will not be saved.')) {
      if (examTimerInterval) clearInterval(examTimerInterval);
      setExamActive(false);
      setExamFinished(false);
    }
  };

  const handleFinishExam = async () => {
    if (examTimerInterval) clearInterval(examTimerInterval);
    setExamActive(false);
    setExamFinished(true);
    
    const timeUsed = (examTime * 60) - examTimeRemaining;
    setExamTimeUsed(timeUsed);

    // Save exam attempt as metadata to Supabase
    try {
      const examCorrectCount = examQuestions.filter(qi => grades[qi] === 'good').length;
      await supabase
        .from('test_attempts')
        .insert({
          user_id: user.id,
          test_id: 'exam_mode',
          score: examCorrectCount,
          total_questions: examQuestions.length,
          attempted_at: new Date().toISOString()
        });
      await logActivity(user.id);
    } catch (err) {
      console.error('Error logging exam attempt:', err);
    }
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (examTimerInterval) clearInterval(examTimerInterval);
    };
  }, [examTimerInterval]);

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Syncing test questions...</p>
        </div>
      </div>
    );
  }

  // Derive score metrics
  const gradedValues = Object.values(grades);
  const knownCount = gradedValues.filter(g => g === 'good').length;
  const gradedTotal = gradedValues.length;
  const accuracy = gradedTotal ? Math.round((knownCount / gradedTotal) * 100) : null;

  // Weakest topics evaluation
  const topicStats = {};
  Object.entries(grades).forEach(([qIdx, gradeType]) => {
    const q = TEST_QUESTIONS[parseInt(qIdx, 10)];
    if (!q) return;
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { good: 0, total: 0 };
    }
    topicStats[q.topic].total++;
    if (gradeType === 'good') {
      topicStats[q.topic].good++;
    }
  });

  const sortedWeakTopics = Object.entries(topicStats)
    .map(([topic, s]) => ({ topic, pct: Math.round((s.good / s.total) * 100), good: s.good, total: s.total }))
    .sort((a, b) => a.pct - b.pct);

  // Filter bank indices
  const filteredIndices = questionOrder.filter(idx => {
    const q = TEST_QUESTIONS[idx];
    const sourceMatch = sourceFilter === 'all' || q.src === sourceFilter;
    const diffMatch = diffFilter === 'all' || q.diff === diffFilter;
    return sourceMatch && diffMatch;
  });

  // Render Timer
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Exam overlay active mode
  if (examActive) {
    const qIdx = examQuestions[examCurrentIdx];
    const q = TEST_QUESTIONS[qIdx];

    return (
      <div className="fade-in">
        <div className="page-header">
          <div className="page-title">
            <h1>Exam Session</h1>
            <p>Complete all questions in the timed block. Review answers at the end.</p>
          </div>
        </div>

        <div className="exam-overlay show">
          <div className="exam-top">
            <div className="exam-progress-text">
              Question {examCurrentIdx + 1} of {examQuestions.length}
            </div>
            <div className={`exam-timer ${examTimeRemaining <= 60 ? 'low' : ''}`}>
              {formatTimer(examTimeRemaining)}
            </div>
            <button className="shuffle-btn" onClick={handleQuitExam}>
              ✕ Quit Exam
            </button>
          </div>

          <div className="qcard" style={{ marginBottom: 0 }}>
            <div className="qcard-top">
              <div className="qcard-tags">
                <span className={`difftag ${q.diff}`}>{q.diff.toUpperCase()}</span>
                <span className="qtag">{q.src.toUpperCase()}</span>
                <span className="qtag">{q.tag}</span>
                <span className="qtag">{q.topic}</span>
              </div>
            </div>
            <div className="qtext">{q.q}</div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
              <button 
                className="grade-btn knew"
                onClick={() => handleGrade(qIdx, 'good')}
                style={{ border: grades[qIdx] === 'good' ? '2px solid var(--good)' : '1px solid var(--border)' }}
              >
                ✓ I know this
              </button>
              <button 
                className="grade-btn missed"
                onClick={() => handleGrade(qIdx, 'bad')}
                style={{ border: grades[qIdx] === 'bad' ? '2px solid var(--danger)' : '1px solid var(--border)' }}
              >
                ✗ I missed this
              </button>
            </div>
          </div>

          <div className="exam-nav">
            <button 
              className="fd-btn"
              onClick={() => {
                const nextIdx = examCurrentIdx - 1;
                setExamCurrentIdx(nextIdx);
              }}
              disabled={examCurrentIdx === 0}
            >
              ← Prev
            </button>
            
            {examCurrentIdx === examQuestions.length - 1 ? (
              <button className="fd-btn mark-done" onClick={handleFinishExam}>
                Finish Exam
              </button>
            ) : (
              <button 
                className="fd-btn mark-done"
                onClick={() => {
                  const nextIdx = examCurrentIdx + 1;
                  setExamCurrentIdx(nextIdx);
                }}
              >
                Next →
              </button>
            )}
          </div>

          {/* Exam progress dots */}
          <div className="exam-dots">
            {examQuestions.map((qi, pos) => {
              const isAnswered = grades[qi] !== undefined;
              const isCurrent = pos === examCurrentIdx;
              return (
                <span
                  key={pos}
                  className={`exam-dot ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}`}
                  onClick={() => {
                    setExamCurrentIdx(pos);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Exam finished/review page
  if (examFinished) {
    const mm = Math.floor(examTimeUsed / 60);
    const ss = examTimeUsed % 60;

    return (
      <div className="fade-in">
        <div className="page-header">
          <div className="page-title">
            <h1>Exam Results & Review</h1>
            <p>Grade the questions honestly and read explanation cards below.</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setExamFinished(false);
              handleResetFilters();
            }}
          >
            All Questions
          </button>
        </div>

        <div className="exam-overlay show" style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <div className="fd-top" style={{ marginBottom: '14px' }}>
            <div className="fd-title" style={{ fontSize: '20px' }}>Reviewing Exam Attempt</div>
            <div className="fd-time">Time used: {mm}m {ss}s / {examTime}m</div>
          </div>

          <div>
            {examQuestions.map((qi, pos) => {
              const item = TEST_QUESTIONS[qi];
              const isRevealed = !!revealedIds[qi];
              
              return (
                <div key={qi} className={`qcard ${item.diff === 'advanced' ? 'diff-advanced' : ''}`}>
                  <div className="qcard-top">
                    <div className="qcard-tags">
                      <span className={`difftag ${item.diff}`}>{item.diff.toUpperCase()}</span>
                      <span className="qtag">{item.src.toUpperCase()}</span>
                      <span className="qtag">{item.tag}</span>
                      <span className="qtag">{item.topic}</span>
                    </div>
                    <span className="qnum">Q{pos + 1} / {examQuestions.length}</span>
                  </div>

                  <div className="qtext">{item.q}</div>

                  {!isRevealed ? (
                    <div className="qcard-actions">
                      <button 
                        className="reveal-btn"
                        onClick={() => setRevealedIds(prev => ({ ...prev, [qi]: true }))}
                      >
                        Reveal answer →
                      </button>
                    </div>
                  ) : (
                    <div className="fade-in">
                      <div className="answer-box">{item.a}</div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button 
                          className="grade-btn knew"
                          onClick={() => handleGrade(qi, 'good')}
                          style={{ border: grades[qi] === 'good' ? '2px solid var(--good)' : '1px solid var(--border)' }}
                        >
                          ✓ I knew it
                        </button>
                        <button 
                          className="grade-btn missed"
                          onClick={() => handleGrade(qi, 'bad')}
                          style={{ border: grades[qi] === 'bad' ? '2px solid var(--danger)' : '1px solid var(--border)' }}
                        >
                          ✗ I missed it
                        </button>
                      </div>
                      {grades[qi] && (
                        <div className={`grade-result ${grades[qi] === 'good' ? 'good' : 'bad'}`} style={{ marginTop: '10px' }}>
                          {grades[qi] === 'good' ? '✓ Marked as known' : '✗ Marked for review'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Normal view mode
  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Test Bank</h1>
          <p>Differentiate RDBMS structures via real questions. Hide answers until you try.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Configuration toolbars */}
      <div className="test-toolbar">
        <div>
          <div className="filter-row-label">SOURCE</div>
          <div className="phase-filter">
            <button className={`chip ${sourceFilter === 'all' ? 'active' : ''}`} onClick={() => setSourceFilter('all')}>All</button>
            <button className={`chip ${sourceFilter === 'company' ? 'active' : ''}`} onClick={() => setSourceFilter('company')}>Company Interview</button>
            <button className={`chip ${sourceFilter === 'gate' ? 'active' : ''}`} onClick={() => setSourceFilter('gate')}>GATE / IIT</button>
            <button className={`chip ${sourceFilter === 'intl' ? 'active' : ''}`} onClick={() => setSourceFilter('intl')}>International</button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="shuffle-btn" onClick={() => setExamConfigOpen(!examConfigOpen)}>⏱ Exam mode</button>
          <button className="shuffle-btn" onClick={handleShuffle}>🔀 Shuffle order</button>
          
          <div className="test-score">
            Score <b style={{ color: 'var(--good)' }}>{knownCount}</b> / {gradedTotal}
            &nbsp;·&nbsp; Accuracy <b style={{ color: 'var(--accent)' }}>{accuracy !== null ? `${accuracy}%` : '—'}</b>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div className="filter-row-label">DIFFICULTY</div>
        <div className="phase-filter">
          <button className={`chip ${diffFilter === 'all' ? 'active' : ''}`} onClick={() => setDiffFilter('all')}>All levels</button>
          <button className={`chip ${diffFilter === 'easy' ? 'active' : ''}`} onClick={() => setDiffFilter('easy')}>Easy</button>
          <button className={`chip ${diffFilter === 'medium' ? 'active' : ''}`} onClick={() => setDiffFilter('medium')}>Medium</button>
          <button className={`chip ${diffFilter === 'hard' ? 'active' : ''}`} onClick={() => setDiffFilter('hard')}>Hard</button>
          <button className={`chip ${diffFilter === 'advanced' ? 'active' : ''}`} onClick={() => setDiffFilter('advanced')}>🔥 Advanced</button>
        </div>
      </div>

      {/* Exam Mode configuration slider */}
      <div className={`exam-config ${examConfigOpen ? 'show' : ''}`}>
        <div className="exam-config-row">
          <div>
            <div className="filter-row-label">QUESTIONS</div>
            <div className="phase-filter">
              {[10, 15, 20, 'all'].map(c => (
                <button 
                  key={c} 
                  className={`chip ${examCount === c ? 'active' : ''}`}
                  onClick={() => setExamCount(c)}
                >
                  {c === 'all' ? `All (${TEST_QUESTIONS.length})` : `${c} questions`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="filter-row-label">TIME LIMIT</div>
            <div className="phase-filter">
              {[10, 15, 20, 30].map(t => (
                <button 
                  key={t} 
                  className={`chip ${examTime === t ? 'active' : ''}`}
                  onClick={() => setExamTime(t)}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleStartExam}>
          Begin Exam →
        </button>
      </div>

      {/* Question Cards List */}
      <div>
        {filteredIndices.map((idx, displayIdx) => {
          const item = TEST_QUESTIONS[idx];
          const isRevealed = !!revealedIds[idx] || grades[idx] !== undefined;
          
          return (
            <div key={idx} className={`qcard ${item.diff === 'advanced' ? 'diff-advanced' : ''}`}>
              <div className="qcard-top">
                <div className="qcard-tags">
                  <span className={`difftag ${item.diff}`}>{item.diff.toUpperCase()}</span>
                  <span className={`qtag src-${item.src}`}>{item.src.toUpperCase()}</span>
                  <span className="qtag">{item.tag}</span>
                  <span className="qtag">{item.topic}</span>
                </div>
                <span className="qnum">Q{displayIdx + 1} / {filteredIndices.length}</span>
              </div>

              <div className="qtext">{item.q}</div>

              {!isRevealed ? (
                <div className="qcard-actions">
                  <button 
                    className="reveal-btn"
                    onClick={() => setRevealedIds(prev => ({ ...prev, [idx]: true }))}
                  >
                    Reveal answer →
                  </button>
                </div>
              ) : (
                <div className="fade-in">
                  <div className="answer-box">{item.a}</div>
                  <div className="grade-row">
                    <button 
                      className="grade-btn knew"
                      onClick={() => handleGrade(idx, 'good')}
                      style={{ border: grades[idx] === 'good' ? '2px solid var(--good)' : '1px solid var(--border)' }}
                    >
                      ✓ I knew it
                    </button>
                    <button 
                      className="grade-btn missed"
                      onClick={() => handleGrade(idx, 'bad')}
                      style={{ border: grades[idx] === 'bad' ? '2px solid var(--danger)' : '1px solid var(--border)' }}
                    >
                      ✗ I missed it
                    </button>
                  </div>
                  {grades[idx] && (
                    <div className={`grade-result ${grades[idx] === 'good' ? 'good' : 'bad'}`}>
                      {grades[idx] === 'good' ? '✓ Marked as known' : '✗ Marked for review'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weakest Topics Dashboard */}
      {sortedWeakTopics.length > 0 && (
        <div className="panel weak-panel">
          <h3>Where you&apos;re weakest</h3>
          <div id="weak-topics">
            {sortedWeakTopics.slice(0, 5).map(({ topic, pct, good, total }) => (
              <div key={topic} className={`weak-topic-row ${pct < 50 ? 'low' : ''}`}>
                <span>{topic}</span>
                <div className="wt-bar">
                  <span style={{ width: `${pct}%` }}></span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
                  {pct}% ({good}/{total})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default TestBank;
