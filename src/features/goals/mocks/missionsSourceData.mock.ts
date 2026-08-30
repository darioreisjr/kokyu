/**
 * `features/missions` doesn't exist yet — `/app/missoes` is a stub page (see `docs/goals.md`).
 * This is a self-contained, forward-looking snapshot so `missionGoalAdapter` can demonstrate its
 * contract now and start reading the real service the day that feature is built, without
 * `goals` changing shape.
 */
export interface MissionsSourceSnapshot {
  completedCount: number;
  completedByCategory: Record<string, number>;
  projectCompletionPercent: Record<string, number>;
}

export const missionsSourceSnapshot: MissionsSourceSnapshot = {
  completedCount: 42,
  completedByCategory: { trabalho: 18, pessoal: 24 },
  projectCompletionPercent: { portfolio: 45 },
};
