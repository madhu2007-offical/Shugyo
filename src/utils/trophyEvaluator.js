/**
 * Evaluates which trophies are unlocked based on user tracking metrics.
 */
export function evaluateTrophies({ progress, checklistItems, testAttempts, streakCount }) {
  const completedNodesCount = progress?.filter(p => p.status === 'done')?.length || 0;
  const inProgressNodesCount = progress?.filter(p => p.status === 'in_progress')?.length || 0;
  const completedChecklistCount = checklistItems?.filter(c => c.completed)?.length || 0;
  const attemptedQuizzesCount = testAttempts?.length || 0;
  
  // Check if there's any 100% quiz score
  const hasPerfectQuiz = testAttempts?.some(attempt => attempt.score === attempt.total_questions) || false;

  return {
    first_step: (completedNodesCount > 0 || inProgressNodesCount > 0),
    roadmap_completionist: (completedNodesCount >= 12),
    first_drill: progress?.some(p => p.node_id.startsWith('drill_') && p.status === 'done') || false,
    sql_master: (progress?.filter(p => p.node_id.startsWith('drill_') && p.status === 'done')?.length >= 5) || false,
    master_of_mastery: (completedChecklistCount >= 5),
    first_quiz: (attemptedQuizzesCount > 0),
    perfect_quiz: hasPerfectQuiz,
    consistency_disciple: (streakCount > 0),
  };
}
