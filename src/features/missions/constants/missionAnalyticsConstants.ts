/** Centralized threshold (spec "SAMPLE SIZE") — below this, `MissionAnalyticsService` omits `estimationAccuracy` rather than showing an unreliable average. */
export const MISSION_ANALYTICS_MIN_SAMPLE_SIZE = 5;

/** Above this many overdue/waiting/blocked items shown at once, review screens paginate instead of listing everything — kept as a single constant so the limit stays consistent. */
export const MISSION_REVIEW_LIST_LIMIT = 20;
