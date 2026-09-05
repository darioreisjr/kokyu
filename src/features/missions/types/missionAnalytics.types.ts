/** No aggregate "productivity score" (spec explicitly forbids it) — only concrete, individually meaningful counts. */
export interface MissionAnalyticsOverview {
  completedCount: number;
  createdCount: number;
  pendingCount: number;
  overdueCount: number;
  rescheduledCount: number;
  totalEstimatedMinutes: number;
  totalActualMinutes: number;
  activeProjectCount: number;
  followUpCount: number;
  blockedCount: number;
  estimationAccuracy?: MissionEstimationAccuracy;
}

/** Only computed once `sampleSize >= MISSION_ANALYTICS_MIN_SAMPLE_SIZE` — see `missionAnalyticsConstants.ts`. */
export interface MissionEstimationAccuracy {
  averageEstimatedMinutes: number;
  averageActualMinutes: number;
  sampleSize: number;
}

export interface MissionSuggestion {
  missionId: string;
  reason: string;
  score: number;
}
