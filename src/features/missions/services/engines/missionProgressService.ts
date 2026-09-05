import type { Mission, MissionChecklistItem } from '../../types';

export interface MissionProgress {
  completed: number;
  total: number;
  percent: number;
}

function toProgress(completed: number, total: number): MissionProgress {
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function calculateChecklistProgress(items: MissionChecklistItem[]): MissionProgress {
  return toProgress(items.filter((item) => item.completed).length, items.length);
}

/** Ignores cancelled/archived submissions, mirroring project progress (spec "SUBMISSION PROGRESS"/"PROJECT PROGRESS"). */
export function calculateSubmissionsProgress(missionId: string, allMissions: Mission[]): MissionProgress {
  const submissions = allMissions.filter((m) => m.parentMissionId === missionId);
  const eligible = submissions.filter((m) => m.status !== 'cancelled' && m.status !== 'archived');
  const completed = eligible.filter((m) => m.status === 'completed');
  return toProgress(completed.length, eligible.length);
}

/**
 * Resolves overall completion percent for a mission according to its `progressMode` — always
 * derived, never a stored redundant percentage (spec "SUBMISSION PROGRESS"/"CHECKLIST PROGRESS": "Derivado.").
 */
export function calculateMissionProgress(
  mission: Mission,
  allMissions: Mission[],
  checklistItems: MissionChecklistItem[],
): MissionProgress {
  if (mission.progressMode === 'submissions') {
    return calculateSubmissionsProgress(mission.id, allMissions);
  }
  if (mission.progressMode === 'checklist') {
    return calculateChecklistProgress(checklistItems);
  }
  return toProgress(mission.status === 'completed' ? 1 : 0, 1);
}
