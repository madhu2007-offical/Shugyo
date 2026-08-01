/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const ProgressContext = createContext({
  loading: true,
  phaseState: {},
  checklistState: [],
  gradeState: {},
  streakDays: [],
  sqlSolved: [],
  examCount: 0,
  badgesEarned: [],
  updatePhaseState: async () => {},
  toggleChecklistItem: async () => {},
  updateGradeState: async () => {},
  toggleStreakDay: async () => {},
  logSqlSolved: async () => {},
  incrementExamCount: async () => {},
  saveBadges: async () => {},
  refreshProgress: async () => {},
});

// eslint-disable-next-line react/prop-types
export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dbRowId, setDbRowId] = useState(null);

  // Consolidated User Progress States
  const [phaseState, setPhaseState] = useState({});
  const [checklistState, setChecklistState] = useState([]);
  const [gradeState, setGradeState] = useState({});
  const [streakDays, setStreakDays] = useState([]);
  const [sqlSolved, setSqlSolved] = useState([]);
  const [examCount, setExamCount] = useState(0);
  const [badgesEarned, setBadgesEarned] = useState([]);

  const fetchOrCreateProgress = async (userId) => {
    try {
      setLoading(true);
      // Try to fetch existing row
      let { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // Fallback: If no progress row exists (e.g. signup trigger was not active), create one
      if (!data) {
        const { data: inserted, error: insertError } = await supabase
          .from('user_progress')
          .insert({ user_id: userId })
          .select('*')
          .single();

        if (insertError) throw insertError;
        data = inserted;
      }

      setDbRowId(data.id);
      setPhaseState(data.phase_state || {});
      setChecklistState(data.checklist_state || []);
      setGradeState(data.grade_state || {});
      setStreakDays(data.streak_days || []);
      setSqlSolved(data.sql_solved || []);
      setExamCount(data.exam_count || 0);
      setBadgesEarned(data.badges_earned || []);
    } catch (err) {
      console.error('Error fetching or creating user progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrCreateProgress(user.id);
    } else {
      // Clear state on logout
      setDbRowId(null);
      setPhaseState({});
      setChecklistState([]);
      setGradeState({});
      setStreakDays([]);
      setSqlSolved([]);
      setExamCount(0);
      setBadgesEarned([]);
      setLoading(false);
    }
  }, [user]);

  // Sync back to Supabase consolidator
  const saveProgressChange = async (fields) => {
    if (!user || !dbRowId) return;
    try {
      const { error } = await supabase
        .from('user_progress')
        .update(fields)
        .eq('id', dbRowId);
      if (error) throw error;
    } catch (err) {
      console.error('Error saving progress update to Cloud:', err);
    }
  };

  const updatePhaseState = async (nodeId, status) => {
    const nextState = { ...phaseState, [nodeId]: status };
    setPhaseState(nextState);
    await saveProgressChange({ phase_state: nextState });
  };

  const toggleChecklistItem = async (itemId) => {
    let nextState;
    if (checklistState.includes(itemId)) {
      nextState = checklistState.filter(id => id !== itemId);
    } else {
      nextState = [...checklistState, itemId];
    }
    setChecklistState(nextState);
    await saveProgressChange({ checklist_state: nextState });
  };

  const updateGradeState = async (questionId, grade) => {
    const nextState = { ...gradeState, [questionId]: grade };
    setGradeState(nextState);
    await saveProgressChange({ grade_state: nextState });
  };

  const toggleStreakDay = async (dateStr) => {
    let nextState;
    if (streakDays.includes(dateStr)) {
      nextState = streakDays.filter(d => d !== dateStr);
    } else {
      nextState = [...streakDays, dateStr];
    }
    setStreakDays(nextState);
    await saveProgressChange({ streak_days: nextState });
  };

  const logSqlSolved = async (drillIdx) => {
    if (sqlSolved.includes(drillIdx)) return;
    const nextState = [...sqlSolved, drillIdx];
    setSqlSolved(nextState);
    await saveProgressChange({ sql_solved: nextState });
  };

  const incrementExamCount = async () => {
    const nextVal = examCount + 1;
    setExamCount(nextVal);
    await saveProgressChange({ exam_count: nextVal });
  };

  const saveBadges = async (badgeIds) => {
    setBadgesEarned(badgeIds);
    await saveProgressChange({ badges_earned: badgeIds });
  };

  const refreshProgress = async () => {
    if (user) {
      await fetchOrCreateProgress(user.id);
    }
  };

  const value = {
    loading,
    phaseState,
    checklistState,
    gradeState,
    streakDays,
    sqlSolved,
    examCount,
    badgesEarned,
    updatePhaseState,
    toggleChecklistItem,
    updateGradeState,
    toggleStreakDay,
    logSqlSolved,
    incrementExamCount,
    saveBadges,
    refreshProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
