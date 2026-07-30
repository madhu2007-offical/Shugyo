import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { calculateStreak } from '../utils/streakCalculator';
import { evaluateTrophies } from '../utils/trophyEvaluator';
import { TROPHIES } from '../data/trackerData';
import { Flame, Award, BookOpen, CheckSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [tests, setTests] = useState([]);
  const [streaks, setStreaks] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        // Fetch Profile
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Fetch Progress
        const progressPromise = supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id);

        // Fetch Checklist Items
        const checklistPromise = supabase
          .from('checklist_items')
          .select('*')
          .eq('user_id', user.id);

        // Fetch Test Attempts
        const testPromise = supabase
          .from('test_attempts')
          .select('*')
          .eq('user_id', user.id);

        // Fetch Streaks
        const streakPromise = supabase
          .from('streaks')
          .select('*')
          .eq('user_id', user.id);

        const [profileRes, progressRes, checklistRes, testRes, streakRes] = await Promise.all([
          profilePromise,
          progressPromise,
          checklistPromise,
          testPromise,
          streakPromise
        ]);

        if (profileRes.error) throw profileRes.error;
        if (progressRes.error) throw progressRes.error;
        if (checklistRes.error) throw checklistRes.error;
        if (testRes.error) throw testRes.error;
        if (streakRes.error) throw streakRes.error;

        setProfile(profileRes.data);
        setProgress(progressRes.data || []);
        setChecklist(checklistRes.data || []);
        setTests(testRes.data || []);
        setStreaks(streakRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setErrorMsg(err.message || 'Failed to load tracking data from database.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-card">
          <div className="spinner"></div>
          <h2>修行 SHUGYO</h2>
          <p>Fetching user metrics...</p>
        </div>
      </div>
    );
  }

  const completedNodesCount = progress.filter(p => !p.node_id.startsWith('drill_') && p.status === 'done').length;
  const inProgressNodesCount = progress.filter(p => !p.node_id.startsWith('drill_') && p.status === 'in_progress').length;
  
  const streakCount = calculateStreak(streaks);
  const trophyStatus = evaluateTrophies({ progress, checklistItems: checklist, testAttempts: tests, streakCount });
  const unlockedTrophyCount = Object.values(trophyStatus).filter(Boolean).length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Welcome, {profile?.username || user?.email.split('@')[0]}</h1>
          <p>Track your SQL and DBMS knowledge mastery progress</p>
        </div>
        <div className="streak-indicator-badge">
          <Flame size={24} color={streakCount > 0 ? '#ff007f' : '#4e5b70'} />
          <span style={{ color: streakCount > 0 ? '#ff007f' : 'inherit', fontWeight: 'bold' }}>
            {streakCount} DAY STREAK
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Stats Widgets */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <BookOpen size={28} />
          </div>
          <div className="stat-details">
            <span className="stat-val">{completedNodesCount} / 12</span>
            <span className="stat-lbl">Topics Mastered</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <CheckSquare size={28} />
          </div>
          <div className="stat-details">
            <span className="stat-val">
              {checklist.filter(c => c.completed).length} / 20
            </span>
            <span className="stat-lbl">Checklist Tasks</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pink">
            <Award size={28} />
          </div>
          <div className="stat-details">
            <span className="stat-val">{unlockedTrophyCount} / {TROPHIES.length}</span>
            <span className="stat-lbl">Trophies Unlocked</span>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <div className="section-card" style={{ marginTop: '2rem' }}>
        <h2>Training Progress</h2>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-secondary)' }}>Roadmap Status</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              You have completed {completedNodesCount} topics and have {inProgressNodesCount} topics currently in progress. 
              Keep studying to unlock advanced database nodes!
            </p>
            <Link to="/roadmap" className="btn btn-primary">
              Open Roadmap
            </Link>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ color: 'var(--color-secondary)' }}>Recent Activity</h3>
            {streaks.length === 0 ? (
              <p style={{ color: 'var(--text-dark)', fontStyle: 'italic' }}>No logged activity yet. Complete some drills or toggle checklist items to record training days.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {streaks
                  .slice(0, 3)
                  .map((streak) => (
                    <div 
                      key={streak.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '0.75rem 1rem', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid var(--border-glass)',
                        borderRadius: '10px'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={16} color="var(--color-secondary)" />
                        Logged Training Session
                      </span>
                      <span className="text-muted">{streak.activity_date}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trophies row */}
      <div className="section-card" style={{ marginTop: '2rem' }}>
        <h2>Trophies & Achievements</h2>
        <div className="trophy-grid">
          {TROPHIES.slice(0, 4).map((t) => {
            const isUnlocked = trophyStatus[t.id];
            return (
              <div key={t.id} className={`trophy-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <Award size={36} className="trophy-icon" />
                <span className="trophy-name">{t.name}</span>
                <span className="trophy-desc">{t.desc}</span>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
          <Link to="/trophies" className="link-btn">
            View All Achievements →
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
