import type { Mission, MissionDerivedFlags } from '../types';

export function isMissionTerminal(mission: Mission): boolean {
  return mission.status === 'completed' || mission.status === 'cancelled' || mission.status === 'archived';
}

/** A mission is unavailable before `availableFrom` — spec "AVAILABLE FROM". No `availableFrom` means always available. */
export function isMissionAvailable(mission: Mission, today: string): boolean {
  if (!mission.availableFrom) return true;
  return mission.availableFrom <= today;
}

/** Only a passed `deadline` on a non-terminal mission is overdue — spec "ATRASADA" explicitly forbids a persisted `overdue` status. */
export function isMissionOverdue(mission: Mission, today: string): boolean {
  if (!mission.deadline) return false;
  if (isMissionTerminal(mission)) return false;
  return mission.deadline < today;
}

export function isMissionDueToday(mission: Mission, today: string): boolean {
  if (isMissionTerminal(mission)) return false;
  return mission.deadline === today;
}

/** A `plannedDate` in the past does not become overdue — spec "PLANNED PAST" — it only flags for review. */
export function missionNeedsReview(mission: Mission, today: string): boolean {
  if (!mission.plannedDate) return false;
  if (isMissionTerminal(mission)) return false;
  return mission.plannedDate < today;
}

export function isMissionFollowUpDue(mission: Mission, today: string): boolean {
  if (!mission.followUpAt) return false;
  if (isMissionTerminal(mission)) return false;
  return mission.followUpAt <= today;
}

export interface MissionDerivedFlagsContext {
  today: string;
  isBlockedByOpenDependency: boolean;
  isScheduledToday: boolean;
}

export function computeMissionDerivedFlags(mission: Mission, context: MissionDerivedFlagsContext): MissionDerivedFlags {
  return {
    overdue: isMissionOverdue(mission, context.today),
    dueToday: isMissionDueToday(mission, context.today),
    availableToday: isMissionAvailable(mission, context.today) && !isMissionTerminal(mission),
    scheduledToday: context.isScheduledToday,
    followUpDue: isMissionFollowUpDue(mission, context.today),
    blocked: mission.status === 'blocked' || context.isBlockedByOpenDependency,
    waiting: mission.status === 'waiting',
    needsReview: missionNeedsReview(mission, context.today),
  };
}
