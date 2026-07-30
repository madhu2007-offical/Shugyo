import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../supabaseClient';
import { QUIZZES } from '../data/trackerData';
import { FileQuestion, AlertCircle, CheckCircle2, ChevronRight, Award } from 'lucide-react';

export function TestBank() {
  const { user } = useAuth();
  
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  
  // Quiz taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [savingScore, setSavingScore] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch historical quiz attempts from DB
  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false });

      if (error) throw error;
      setQuizAttempts(data || []);
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
      setErrorMsg('Failed to load past quiz attempts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAttempts();
    }
  }, [user]);

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setScore(0);
    setErrorMsg('');
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate Score
      let correctCount = 0;
      activeQuiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });

      setScore(correctCount);
      setQuizFinished(true);
      saveQuizAttempt(correctCount);
    }
  };

  const saveQuizAttempt = async (finalScore) => {
    setSavingScore(true);
    try {
      const { error } = await supabase
        .from('test_attempts')
        .insert({
          user_id: user.id,
          test_id: activeQuiz.id,
          score: finalScore,
          total_questions: activeQuiz.questions.length,
          attempted_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Log activity to streaks
      await logActivity(user.id);
      
      // Refresh attempts list
      await fetchAttempts();
    } catch (err) {
      console.error('Error logging quiz attempt:', err);
      setErrorMsg('Failed to log your score to the database.');
    } finally {
      setSavingScore(false);
    }
  };

  const getBestScore = (quizId) => {
    const attempts = quizAttempts.filter(a => a.test_id === quizId);
    if (attempts.length === 0) return null;
    const maxScore = Math.max(...attempts.map(a => a.score));
    const total = attempts[0].total_questions;
    return { score: maxScore, total };
  };

  if (loading && !activeQuiz) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Loading test banks...</p>
        </div>
      </div>
    );
  }

  // Quiz active mode
  if (activeQuiz) {
    const q = activeQuiz.questions[currentQuestionIndex];
    const isAnswerSelected = selectedAnswers[currentQuestionIndex] !== undefined;

    return (
      <div className="fade-in">
        <div className="page-header">
          <div className="page-title">
            <h1>{activeQuiz.title}</h1>
            <p>Answer all questions carefully to sync your score.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setActiveQuiz(null)}>
            Leave Quiz
          </button>
        </div>

        {!quizFinished ? (
          <div className="quiz-active-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="quiz-question-number">
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </span>
              <div style={{ width: '150px', background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
                  background: 'var(--color-secondary)',
                  height: '100%',
                  transition: 'width var(--transition-fast)'
                }} />
              </div>
            </div>

            <div className="quiz-question-text">
              {q.question}
            </div>

            <div className="quiz-options-list">
              {q.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                return (
                  <button
                    key={idx}
                    className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(idx)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="quiz-navigation-footer">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {!isAnswerSelected && 'Select an option to proceed'}
              </span>
              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
                disabled={!isAnswerSelected}
              >
                {currentQuestionIndex === activeQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        ) : (
          <div className="quiz-active-card text-center" style={{ alignItems: 'center' }}>
            <Award size={64} className="accent-glow" style={{ color: 'var(--color-warning)' }} />
            <h2>Quiz Completed!</h2>
            <p className="subtitle">Your score has been logged to the database.</p>
            
            <div style={{ margin: '2rem 0' }}>
              <span style={{ fontSize: '4rem', fontWeight: '800', color: score === activeQuiz.questions.length ? 'var(--color-success)' : 'inherit' }}>
                {score}
              </span>
              <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>
                {' '} / {activeQuiz.questions.length}
              </span>
              <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                {score === activeQuiz.questions.length ? 'Master Class! Perfect Score!' : score >= 3 ? 'Great job! Passing Score!' : 'Keep training! Retake is recommended.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => handleStartQuiz(activeQuiz)}>
                Retake Quiz
              </button>
              <button className="btn btn-primary" onClick={() => setActiveQuiz(null)}>
                All Quizzes
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Test Bank</h1>
          <p>Challenge yourself with quizzes to verify database system model logic.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="quiz-grid">
        <div className="quiz-list-card">
          <h2>Select a Test</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
            {QUIZZES.map((quiz) => {
              const bestRecord = getBestScore(quiz.id);
              const attemptsCount = quizAttempts.filter(a => a.test_id === quiz.id).length;

              return (
                <div key={quiz.id} className="quiz-card">
                  <div className="quiz-info">
                    <h3>{quiz.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {quiz.description}
                    </p>
                    <div className="quiz-stats">
                      {bestRecord ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle2 size={14} color="var(--color-success)" />
                          Best Score: <strong>{bestRecord.score} / {bestRecord.total}</strong> ({attemptsCount} attempts)
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertCircle size={14} color="var(--text-dark)" />
                          No attempts logged yet
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => handleStartQuiz(quiz)}>
                    Start Quiz <ChevronRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* past attempts logs */}
        <div className="section-card">
          <h2>Attempt History Log</h2>
          {quizAttempts.length === 0 ? (
            <p style={{ color: 'var(--text-dark)', fontStyle: 'italic', marginTop: '1rem' }}>
              Your quiz scores will be logged here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {quizAttempts.slice(0, 5).map((attempt) => {
                const quizTitle = QUIZZES.find(q => q.id === attempt.test_id)?.title || 'Database Quiz';
                return (
                  <div 
                    key={attempt.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px'
                    }}
                  >
                    <div>
                      <strong>{quizTitle}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Date: {new Date(attempt.attempted_at).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      Score: <strong style={{ color: attempt.score === attempt.total_questions ? 'var(--color-success)' : 'inherit' }}>{attempt.score} / {attempt.total_questions}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default TestBank;
