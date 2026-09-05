import type { Mission, MissionDependency, MissionStatus } from '../../types';
import { isMissionTerminal } from '../../utils/missionDateStatus';

export type MissionStatusById = Record<string, MissionStatus | undefined>;

export function getBlockerIds(missionId: string, dependencies: MissionDependency[]): string[] {
  return dependencies.filter((d) => d.blockedMissionId === missionId).map((d) => d.blockerMissionId);
}

export function getBlockedIds(missionId: string, dependencies: MissionDependency[]): string[] {
  return dependencies.filter((d) => d.blockerMissionId === missionId).map((d) => d.blockedMissionId);
}

function isOpenStatus(status: MissionStatus | undefined): boolean {
  return status !== undefined && status !== 'completed' && status !== 'cancelled' && status !== 'archived';
}

export function getOpenBlockerIds(missionId: string, dependencies: MissionDependency[], statusById: MissionStatusById): string[] {
  return getBlockerIds(missionId, dependencies).filter((id) => isOpenStatus(statusById[id]));
}

export function isMissionBlocked(missionId: string, dependencies: MissionDependency[], statusById: MissionStatusById): boolean {
  return getOpenBlockerIds(missionId, dependencies, statusById).length > 0;
}

/** BFS over existing "blocks" edges starting at `blockedMissionId` — a path back to `blockerMissionId` means the new edge would close a loop. */
export function wouldCreateCycle(
  blockerMissionId: string,
  blockedMissionId: string,
  dependencies: MissionDependency[],
): boolean {
  if (blockerMissionId === blockedMissionId) return true;

  const visited = new Set<string>();
  const queue: string[] = [blockedMissionId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === blockerMissionId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    queue.push(...getBlockedIds(current, dependencies));
  }

  return false;
}

export type MissionDependencyValidationError = 'selfReference' | 'duplicate' | 'cycle';

export interface MissionDependencyValidationResult {
  valid: boolean;
  error?: MissionDependencyValidationError;
}

export function validateNewDependency(
  blockerMissionId: string,
  blockedMissionId: string,
  dependencies: MissionDependency[],
): MissionDependencyValidationResult {
  if (blockerMissionId === blockedMissionId) {
    return { valid: false, error: 'selfReference' };
  }

  const isDuplicate = dependencies.some(
    (d) => d.blockerMissionId === blockerMissionId && d.blockedMissionId === blockedMissionId,
  );
  if (isDuplicate) {
    return { valid: false, error: 'duplicate' };
  }

  if (wouldCreateCycle(blockerMissionId, blockedMissionId, dependencies)) {
    return { valid: false, error: 'cycle' };
  }

  return { valid: true };
}

/** For UI copy like "Bloqueada por 2 missões" (spec) — never hides the mission, just counts. */
export function countOpenBlockers(missionId: string, dependencies: MissionDependency[], missions: Mission[]): number {
  const statusById: MissionStatusById = Object.fromEntries(missions.map((m) => [m.id, m.status]));
  return getOpenBlockerIds(missionId, dependencies, statusById).length;
}

/** Missions that become unblocked once `completedMissionId` is marked completed — used to raise the (never-auto-applied) unblock notification. */
export function getMissionsUnblockedBy(
  completedMissionId: string,
  dependencies: MissionDependency[],
  missions: Mission[],
): string[] {
  const statusById: MissionStatusById = Object.fromEntries(
    missions.map((m) => [m.id, m.id === completedMissionId ? 'completed' : m.status]),
  );
  return getBlockedIds(completedMissionId, dependencies).filter(
    (missionId) => !isMissionBlocked(missionId, dependencies, statusById),
  );
}

export function missionIsTerminalStatus(mission: Mission): boolean {
  return isMissionTerminal(mission);
}
