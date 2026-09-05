import type { Mission } from '../types';

export interface MissionTodayInclusionContext {
  today: string;
  isScheduledToday: boolean;
  isManuallyFocused: boolean;
  isFollowUpDue: boolean;
}

/**
 * "Hoje" is not `deadline == today` (spec "HOJE"). A mission shows up because it was planned for
 * today, has a `ScheduleEntry` today, is due today, was manually added to today's focus, or has a
 * relevant follow-up due — never because it was simply incomplete yesterday (spec "NÃO LEVAR
 * ONTEM AUTOMATICAMENTE": that only ever appears under Suggestions).
 */
export function shouldAppearInToday(mission: Mission, context: MissionTodayInclusionContext): boolean {
  if (mission.status === 'cancelled' || mission.status === 'archived') return false;

  const plannedToday = mission.plannedDate === context.today;
  const deadlineToday = mission.deadline === context.today;
  // Completed *today* stays visible (collapsed), see spec "CONCLUÍDAS" — a mission completed on
  // some earlier day must NOT resurface in Today just because it's terminal.
  const completedToday = mission.status === 'completed' && (mission.completedAt ?? '').startsWith(context.today);

  return (
    plannedToday ||
    deadlineToday ||
    context.isScheduledToday ||
    context.isManuallyFocused ||
    context.isFollowUpDue ||
    completedToday
  );
}
