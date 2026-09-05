import { MISSION_ANALYTICS_MIN_SAMPLE_SIZE } from '../../constants/missionAnalyticsConstants';
import type { Mission, MissionAnalyticsOverview, MissionProject } from '../../types';
import { isMissionOverdue } from '../../utils/missionDateStatus';

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Only concrete, individually meaningful counts — no aggregate "productivity score" (spec
 * "NÃO CRIAR PRODUCTIVITY SCORE"). `estimationAccuracy` is omitted below the sample threshold
 * instead of showing an unreliable average (spec "SAMPLE SIZE").
 */
export function getMissionAnalyticsOverview(
  missions: Mission[],
  projects: MissionProject[],
  today: string,
): MissionAnalyticsOverview {
  const completed = missions.filter((m) => m.status === 'completed');
  const pending = missions.filter((m) => m.status !== 'completed' && m.status !== 'cancelled' && m.status !== 'archived');
  const overdue = missions.filter((m) => isMissionOverdue(m, today));
  const blocked = missions.filter((m) => m.status === 'blocked');
  const waitingWithFollowUp = missions.filter((m) => m.status === 'waiting' && m.followUpAt);
  const activeProjects = projects.filter((p) => p.status === 'active');

  const sample = missions.filter(
    (m) => m.estimatedDuration !== undefined && m.actualDurationMinutes !== undefined,
  ) as (Mission & { estimatedDuration: number; actualDurationMinutes: number })[];

  const estimationAccuracy =
    sample.length >= MISSION_ANALYTICS_MIN_SAMPLE_SIZE
      ? {
          averageEstimatedMinutes: Math.round(average(sample.map((m) => m.estimatedDuration))),
          averageActualMinutes: Math.round(average(sample.map((m) => m.actualDurationMinutes))),
          sampleSize: sample.length,
        }
      : undefined;

  return {
    completedCount: completed.length,
    createdCount: missions.length,
    pendingCount: pending.length,
    overdueCount: overdue.length,
    rescheduledCount: missions.reduce((sum, m) => sum + (m.replanCount ?? 0), 0),
    totalEstimatedMinutes: missions.reduce((sum, m) => sum + (m.estimatedDuration ?? 0), 0),
    totalActualMinutes: missions.reduce((sum, m) => sum + (m.actualDurationMinutes ?? 0), 0),
    activeProjectCount: activeProjects.length,
    followUpCount: waitingWithFollowUp.length,
    blockedCount: blocked.length,
    estimationAccuracy,
  };
}

/** Renders the spec's exact non-judgmental phrasing instead of a raw number when relevant. */
export function formatEstimationAccuracyMessage(overview: MissionAnalyticsOverview): string | null {
  if (!overview.estimationAccuracy) return null;
  const { averageEstimatedMinutes, averageActualMinutes } = overview.estimationAccuracy;
  if (averageEstimatedMinutes === averageActualMinutes) return null;
  return `Você estimou em média ${averageEstimatedMinutes} min, mas Missões semelhantes têm levado aproximadamente ${averageActualMinutes} min.`;
}
