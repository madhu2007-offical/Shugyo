/**
 * Evaluates which achievements are unlocked based on user tracking metrics.
 */
export function evaluateAchievements({ progress, checklistItems, questionGrades, testAttempts, streakCount }) {
  // 1. Progress counts
  const completedPhases = progress?.filter(p => !p.node_id.startsWith('drill_') && p.status === 'done') || [];
  const completedPhasesCount = completedPhases.length;
  const isP0Done = progress?.some(p => p.node_id === '0' && p.status === 'done') || false;

  // 2. Checklist milestones
  const completedChecklistCount = checklistItems?.filter(c => c.completed)?.length || 0;

  // 3. SQL Drills count
  const solvedDrillsCount = progress?.filter(p => p.node_id.startsWith('drill_') && p.status === 'done')?.length || 0;

  // 4. Test Graded questions
  const gradedQuestionsCount = questionGrades?.length || 0;
  const correctGradedCount = questionGrades?.filter(g => g.grade === 'good')?.length || 0;
  const accuracy = gradedQuestionsCount > 0 ? (correctGradedCount / gradedQuestionsCount) : 0;

  // 5. Exam mode completions
  const completedExamsCount = testAttempts?.filter(t => t.test_id === 'exam_mode')?.length || 0;

  // 6. Check if any 'advanced' question is correct
  // In trackerData.js, indices of advanced questions are:
  // Let's identify the advanced question indices from TEST_QUESTIONS:
  // We can pass the advanced indices or check in the caller. Since we don't have TEST_QUESTIONS here directly,
  // we can check if the graded question list contains any ID corresponding to an advanced question.
  // Advanced questions in trackerData.js are:
  // Q50 to Q58 (0-indexed: 49 to 58, wait:
  // let's look at the questions indices in trackerData:
  // easy: 0-24 (25 questions)
  // medium: 25-44 (20 questions)
  // hard: 45-59 (15 questions)
  // advanced: 60-78 (19 questions)
  // So indexes >= 60 are advanced!
  // Let's check that.
  const hasCorrectAdvancedQuestion = questionGrades?.some(g => g.grade === 'good' && parseInt(g.question_id, 10) >= 60) || false;

  return {
    'first-steps': isP0Done,
    'halfway': (completedPhasesCount >= 5),
    'full-stack': (completedPhasesCount >= 9),
    'checklist-crusher': (completedChecklistCount >= 10),
    'query-whisperer': (solvedDrillsCount >= 5),
    'sql-grandmaster': (solvedDrillsCount >= 14),
    'on-a-roll': (streakCount >= 3),
    'unstoppable': (streakCount >= 7),
    'iron-will': (streakCount >= 30),
    'sharp-mind': (gradedQuestionsCount >= 20),
    'know-it-all': (gradedQuestionsCount >= 30 && accuracy >= 0.90),
    'under-pressure': (completedExamsCount >= 1),
    'fearless': hasCorrectAdvancedQuestion,
  };
}
