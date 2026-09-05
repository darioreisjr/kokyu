import type { Mission } from '@/features/missions/types';
import { missionService } from '@/features/missions/services/missionService';
import { isMissionOverdue } from '@/features/missions/utils/missionDateStatus';
import type {
  HomeMissionSummary,
  HomeProviderContext,
  HomeSectionProvider,
  MissionHomeProjection,
  MissionHomeStatus,
} from '@/shared/home/types';

const OVERDUE_LIMIT = 3;
const WAITING_LIMIT = 3;

const PRIORITY_RANK: Record<Mission['priority'], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

function isMissionOpen(mission: Mission): boolean {
  return mission.status !== 'completed' && mission.status !== 'cancelled' && mission.status !== 'archived';
}

function resolveStatus(mission: Mission, today: string): MissionHomeStatus {
  if (mission.status === 'completed') return 'completed';
  if (mission.status === 'waiting') return 'waitingFollowUp';
  if (isMissionOverdue(mission, today)) return 'overdue';
  return 'pending';
}

function toSummary(mission: Mission, today: string): HomeMissionSummary {
  return {
    id: mission.id,
    title: mission.title,
    status: resolveStatus(mission, today),
    dueDate: mission.deadline ?? mission.plannedDate,
    estimatedDurationMinutes: mission.estimatedDuration,
  };
}

/**
 * `features/missions` exists — this reads the real `missionService` (home is a documented
 * exception to "features never import features": see `docs/respiration-home.md`, the same
 * precedent `dailyRhythmHomeProvider`/`habitHomeProvider` already use). "Focus today" isn't a
 * stored Mission field — it's the highest-priority open mission that already qualifies for Today
 * (spec has no single persisted "focus" flag on Mission; the real 1-3 mission selection lives in
 * Ritmo Diário's `DailyPriority`, which `homeSnapshotService` composes separately).
 */
export const missionHomeProvider: HomeSectionProvider<MissionHomeProjection> = {
  sourceType: 'mission',
  label: 'Missões',

  async getHomeProjection(context: HomeProviderContext): Promise<MissionHomeProjection> {
    const today = context.date;
    const [allMissions, todayMissions] = await Promise.all([
      missionService.getMissions(),
      missionService.getTodayMissions(),
    ]);

    const openToday = todayMissions.filter(isMissionOpen);
    const focusMission =
      [...openToday].sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])[0] ??
      // Nothing open today — but a mission completed today should still show, struck through, per spec's "keep visible" rule.
      todayMissions.find((m) => m.status === 'completed') ??
      null;
    const focusToday = focusMission ? toSummary(focusMission, today) : null;

    const next =
      allMissions
        .filter(isMissionOpen)
        .filter((m) => m.id !== focusMission?.id)
        .filter((m) => m.deadline ?? m.plannedDate)
        .sort((a, b) => (a.deadline ?? a.plannedDate ?? '9999-99-99').localeCompare(b.deadline ?? b.plannedDate ?? '9999-99-99'))[0] ??
      null;

    const pendingCount = todayMissions.filter((m) => resolveStatus(m, today) === 'pending').length;
    const completedCount = todayMissions.filter((m) => m.status === 'completed').length;

    const overdue = allMissions
      .filter((m) => isMissionOverdue(m, today))
      .slice(0, OVERDUE_LIMIT)
      .map((m) => toSummary(m, today));

    const waitingFollowUp = allMissions
      .filter((m) => m.status === 'waiting' && m.followUpAt !== undefined && m.followUpAt <= today)
      .slice(0, WAITING_LIMIT)
      .map((m) => toSummary(m, today));

    return {
      focusToday,
      next: next ? toSummary(next, today) : null,
      pendingCount,
      completedCount,
      overdue,
      waitingFollowUp,
    };
  },
};
