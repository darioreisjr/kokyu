import type { Mission, MissionDependency } from '../../types';
import { isMissionBlocked, type MissionStatusById } from './missionDependencyEngine';

const PRIORITY_RANK: Record<Mission['priority'], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

/**
 * The first mission in a project that's `ready` or `planned` and not blocked — GTD's "next
 * action" concept, borrowed without pulling in the rest of GTD (spec "CONTEXTO GTD").
 */
export function getProjectNextAction(
  projectId: string,
  missions: Mission[],
  dependencies: MissionDependency[],
): Mission | null {
  const statusById: MissionStatusById = Object.fromEntries(missions.map((m) => [m.id, m.status]));

  const candidates = missions.filter(
    (m) =>
      m.projectId === projectId &&
      (m.status === 'ready' || m.status === 'planned') &&
      !isMissionBlocked(m.id, dependencies, statusById),
  );

  if (candidates.length === 0) return null;

  return [...candidates].sort((a, b) => {
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;

    const priorityDiff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    return a.createdAt.localeCompare(b.createdAt);
  })[0]!;
}
