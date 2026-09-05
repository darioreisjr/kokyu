import type { Mission, MissionProjectProgress } from '../../types';

/**
 * `completionRatio` strategy (spec "PROGRESSO DO PROJETO"): completed eligible / eligible,
 * ignoring cancelled/archived missions entirely (they neither count for nor against progress).
 * `manual`/`weighted`/`milestone` strategies are prepared type members but not implemented yet.
 */
export function calculateProjectProgress(projectId: string, missions: Mission[]): MissionProjectProgress {
  const projectMissions = missions.filter((m) => m.projectId === projectId);
  const eligible = projectMissions.filter((m) => m.status !== 'cancelled' && m.status !== 'archived');
  const completedCount = eligible.filter((m) => m.status === 'completed').length;
  const percent = eligible.length === 0 ? 0 : Math.round((completedCount / eligible.length) * 100);

  return { completedCount, eligibleCount: eligible.length, percent };
}
