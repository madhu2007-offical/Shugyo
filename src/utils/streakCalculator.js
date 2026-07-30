/**
 * Computes the current consecutive daily streak from a list of streak records.
 * Streak records contain an activity_date field (string, 'YYYY-MM-DD').
 */
export function calculateStreak(streaks) {
  if (!streaks || streaks.length === 0) return 0;

  // Extract unique sorted dates (descending order)
  const dates = Array.from(new Set(streaks.map(s => s.activity_date)))
    .sort((a, b) => new Date(b) - new Date(a));

  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const mostRecentDate = dates[0];

  // If the user's last activity is neither today nor yesterday, the streak is broken (0)
  if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
    return 0;
  }

  let streakCount = 1;
  let currentRef = new Date(mostRecentDate);

  for (let i = 1; i < dates.length; i++) {
    const nextDate = new Date(dates[i]);
    const diffTime = Math.abs(currentRef - nextDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      streakCount++;
      currentRef = nextDate;
    } else if (diffDays > 1) {
      // Gap found, streak ends here
      break;
    }
    // If diffDays is 0 (duplicate date), we ignore it and continue
  }

  return streakCount;
}
