/** `features/habits` doesn't exist yet — see the note in `missionsSourceData.mock.ts`; same forward-looking shape for `habitGoalAdapter`. */
export interface HabitsSourceSnapshot {
  totalExecutions: number;
  longestStreakDays: number;
  consistencyRatePercent: number;
  daysCompletedThisMonth: number;
}

export const habitsSourceSnapshot: HabitsSourceSnapshot = {
  totalExecutions: 210,
  longestStreakDays: 34,
  consistencyRatePercent: 90,
  daysCompletedThisMonth: 24,
};
