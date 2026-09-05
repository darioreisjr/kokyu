import type {
  Mission,
  MissionActivity,
  MissionActivityType,
  MissionAnalyticsOverview,
  MissionDependency,
  MissionStatus,
  MissionSuggestion,
} from '../types';
import { generateNextOccurrence } from './engines/missionRecurrenceEngine';
import { getMissionAnalyticsOverview } from './engines/missionAnalyticsService';
import {
  getBlockedIds,
  getBlockerIds,
  getOpenBlockerIds,
  isMissionBlocked,
  validateNewDependency,
  type MissionStatusById,
} from './engines/missionDependencyEngine';
import { getMissionSuggestions as computeMissionSuggestions } from './engines/missionSuggestionService';
import { generateId, missionDb } from './missionMockDb';
import { isMissionAvailable, isMissionOverdue, isMissionTerminal } from '../utils/missionDateStatus';
import { shouldAppearInToday } from '../utils/missionTodayInclusion';
import { todayKey } from '../utils/missionDateKey';

export type MissionInput = Omit<
  Mission,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'completedAt'
  | 'cancelledAt'
  | 'archivedAt'
  | 'contextIds'
  | 'tagIds'
  | 'goalIds'
  | 'scheduleEntryIds'
  | 'reminderIds'
  | 'progressMode'
  | 'source'
  | 'status'
  | 'priority'
  | 'replanCount'
> &
  Partial<
    Pick<
      Mission,
      | 'contextIds'
      | 'tagIds'
      | 'goalIds'
      | 'scheduleEntryIds'
      | 'reminderIds'
      | 'progressMode'
      | 'source'
      | 'status'
      | 'priority'
      | 'replanCount'
    >
  >;

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * A mission with no explicit organization (no project, no plan, no deadline, no priority) lands
 * in Inbox — spec "INBOX". Anything with intent already attached is `ready` immediately, so Quick
 * Capture from a form that already set a project/date doesn't force a redundant inbox stop.
 */
function deriveInitialStatus(input: MissionInput): MissionStatus {
  if (input.status) return input.status;
  if (input.plannedDate) return 'planned';
  if (input.projectId || input.deadline || (input.priority && input.priority !== 'none')) return 'ready';
  return 'inbox';
}

function recordActivity(missionId: string, type: MissionActivityType, detail?: string): MissionActivity {
  const activity: MissionActivity = {
    id: generateId('activity'),
    missionId,
    type,
    detail,
    createdAt: nowIso(),
  };
  missionDb.activity.push(activity);
  return activity;
}

function buildStatusById(): MissionStatusById {
  return Object.fromEntries(missionDb.missions.map((m) => [m.id, m.status]));
}

export const missionService = {
  // ----------------------------------------------------
  // CRUD
  // ----------------------------------------------------

  async getMissions(): Promise<Mission[]> {
    return [...missionDb.missions];
  },

  async getMission(id: string): Promise<Mission | null> {
    const mission = missionDb.missions.find((m) => m.id === id);
    return mission ? { ...mission } : null;
  },

  async createMission(input: MissionInput): Promise<Mission> {
    const now = nowIso();
    const status = deriveInitialStatus(input);
    const mission: Mission = {
      ...input,
      id: generateId('mission'),
      status,
      priority: input.priority ?? 'none',
      contextIds: input.contextIds ?? [],
      tagIds: input.tagIds ?? [],
      goalIds: input.goalIds ?? [],
      scheduleEntryIds: input.scheduleEntryIds ?? [],
      reminderIds: input.reminderIds ?? [],
      progressMode: input.progressMode ?? 'binary',
      source: input.source ?? 'manual',
      replanCount: input.replanCount ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    missionDb.missions.push(mission);
    recordActivity(mission.id, 'created');
    return { ...mission };
  },

  async updateMission(id: string, patch: Partial<MissionInput>): Promise<Mission | null> {
    const index = missionDb.missions.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const existing = missionDb.missions[index]!;

    const plannedDateChanged =
      patch.plannedDate !== undefined && patch.plannedDate !== existing.plannedDate && existing.plannedDate !== undefined;
    const priorityChanged = patch.priority !== undefined && patch.priority !== existing.priority;
    const deadlineChanged = patch.deadline !== undefined && patch.deadline !== existing.deadline;
    const projectChanged = patch.projectId !== undefined && patch.projectId !== existing.projectId;

    const updated: Mission = {
      ...existing,
      ...patch,
      replanCount: plannedDateChanged ? existing.replanCount + 1 : existing.replanCount,
      updatedAt: nowIso(),
    };
    missionDb.missions[index] = updated;

    recordActivity(id, 'updated');
    if (plannedDateChanged) recordActivity(id, 'rescheduled', `Replanejada para ${patch.plannedDate}`);
    if (priorityChanged) recordActivity(id, 'priorityChanged', `${existing.priority} → ${patch.priority}`);
    if (deadlineChanged) recordActivity(id, 'deadlineChanged', `${existing.deadline ?? '—'} → ${patch.deadline ?? '—'}`);
    if (projectChanged) recordActivity(id, 'projectChanged');

    return { ...updated };
  },

  /** Ritmo Diário calls this when a mission is dropped into a time slot or moved — never touches `deadline` (spec "DEADLINE NÃO MUDA"). */
  async scheduleMission(id: string, plannedDate: string, scheduledStartAt?: string): Promise<Mission | null> {
    const index = missionDb.missions.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const existing = missionDb.missions[index]!;
    const isReschedule = existing.plannedDate !== undefined && existing.plannedDate !== plannedDate;

    const updated: Mission = {
      ...existing,
      plannedDate,
      scheduledStartAt,
      status: existing.status === 'inbox' ? 'planned' : existing.status === 'ready' ? 'planned' : existing.status,
      replanCount: isReschedule ? existing.replanCount + 1 : existing.replanCount,
      updatedAt: nowIso(),
    };
    missionDb.missions[index] = updated;
    recordActivity(id, isReschedule ? 'rescheduled' : 'scheduled', `${plannedDate}${scheduledStartAt ? ` ${scheduledStartAt}` : ''}`);
    return { ...updated };
  },

  /** Removing a schedule slot never deletes the mission (spec "REMOVER HORÁRIO") — it just returns to backlog/ready. */
  async unscheduleMission(id: string): Promise<Mission | null> {
    const index = missionDb.missions.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const existing = missionDb.missions[index]!;
    const updated: Mission = {
      ...existing,
      plannedDate: undefined,
      scheduledStartAt: undefined,
      status: existing.status === 'planned' ? 'ready' : existing.status,
      updatedAt: nowIso(),
    };
    missionDb.missions[index] = updated;
    return { ...updated };
  },

  async completeMission(id: string): Promise<Mission | null> {
    const index = missionDb.missions.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const existing = missionDb.missions[index]!;
    const now = nowIso();
    const updated: Mission = { ...existing, status: 'completed', completedAt: now, updatedAt: now };
    missionDb.missions[index] = updated;
    recordActivity(id, 'completed');

    if (existing.recurrenceRule) {
      const priorOccurrences = missionDb.missions.filter(
        (m) => m.recurrenceSeriesId === (existing.recurrenceSeriesId ?? existing.id),
      ).length;
      const nextInput = generateNextOccurrence({
        completedMission: existing,
        completionDate: todayKey(),
        nextOccurrenceIndex: priorOccurrences + 1,
      });
      if (nextInput) {
        const nextMission: Mission = { ...nextInput, id: generateId('mission'), createdAt: now, updatedAt: now };
        missionDb.missions.push(nextMission);
        recordActivity(nextMission.id, 'created', `Próxima ocorrência de "${existing.title}"`);
      }
    }

    return { ...updated };
  },

  async reopenMission(id: string): Promise<Mission | null> {
    const index = missionDb.missions.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const existing = missionDb.missions[index]!;
    const updated: Mission = { ...existing, status: 'ready', completedAt: undefined, updatedAt: nowIso() };
    missionDb.missions[index] = updated;
    recordActivity(id, 'reopened');
    return { ...updated };
  },

  async cancelMission(id: string): Promise<Mission | null> {
    const index = missionDb.missions.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const existing = missionDb.missions[index]!;
    const now = nowIso();
    const updated: Mission = { ...existing, status: 'cancelled', cancelledAt: now, updatedAt: now };
    missionDb.missions[index] = updated;
    recordActivity(id, 'cancelled');
    return { ...updated };
  },

  async archiveMission(id: string): Promise<Mission | null> {
    const index = missionDb.missions.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const existing = missionDb.missions[index]!;
    const now = nowIso();
    const updated: Mission = { ...existing, status: 'archived', archivedAt: now, updatedAt: now };
    missionDb.missions[index] = updated;
    recordActivity(id, 'archived');
    return { ...updated };
  },

  async deleteMission(id: string): Promise<void> {
    missionDb.missions = missionDb.missions.filter((m) => m.id !== id);
    missionDb.checklistItems = missionDb.checklistItems.filter((c) => c.missionId !== id);
    missionDb.dependencies = missionDb.dependencies.filter(
      (d) => d.blockerMissionId !== id && d.blockedMissionId !== id,
    );
    missionDb.activity = missionDb.activity.filter((a) => a.missionId !== id);
  },

  async bulkUpdateMissions(ids: string[], patch: Partial<MissionInput>): Promise<Mission[]> {
    const results: Mission[] = [];
    for (const id of ids) {
      const updated = await missionService.updateMission(id, patch);
      if (updated) results.push(updated);
    }
    return results;
  },

  // ----------------------------------------------------
  // ORGANIZATION VIEWS
  // ----------------------------------------------------

  async getInboxMissions(): Promise<Mission[]> {
    return missionDb.missions.filter((m) => m.status === 'inbox').map((m) => ({ ...m }));
  },

  /** One of the quick actions from spec "INBOX PROCESSING" — moves a mission out of `inbox` with the chosen organization applied. */
  async processInboxMission(
    id: string,
    action:
      | { type: 'doToday'; plannedDate: string }
      | { type: 'plan'; plannedDate: string }
      | { type: 'moveToProject'; projectId: string; sectionId?: string }
      | { type: 'setDeadline'; deadline: string }
      | { type: 'setPriority'; priority: Mission['priority'] }
      | { type: 'backlog' }
      | { type: 'delete' },
  ): Promise<Mission | null> {
    if (action.type === 'delete') {
      await missionService.deleteMission(id);
      return null;
    }
    if (action.type === 'backlog') {
      return missionService.updateMission(id, { status: 'ready' });
    }
    if (action.type === 'doToday' || action.type === 'plan') {
      return missionService.updateMission(id, { status: 'planned', plannedDate: action.plannedDate });
    }
    if (action.type === 'moveToProject') {
      return missionService.updateMission(id, {
        status: 'ready',
        projectId: action.projectId,
        sectionId: action.sectionId,
      });
    }
    if (action.type === 'setDeadline') {
      return missionService.updateMission(id, { status: 'ready', deadline: action.deadline });
    }
    return missionService.updateMission(id, { status: 'ready', priority: action.priority });
  },

  /** Backlog: organized but without a temporal commitment yet — spec "BACKLOG" vs. "INBOX". */
  async getBacklog(): Promise<Mission[]> {
    return missionDb.missions
      .filter((m) => m.status === 'ready' && !m.plannedDate)
      .map((m) => ({ ...m }));
  },

  async getWaitingMissions(): Promise<Mission[]> {
    return missionDb.missions.filter((m) => m.status === 'waiting').map((m) => ({ ...m }));
  },

  /** Temporal grouping for "Próximas" — everything with a future `plannedDate` or `deadline`, terminal statuses excluded. */
  async getUpcomingMissions(): Promise<Mission[]> {
    const today = todayKey();
    return missionDb.missions
      .filter((m) => !isMissionTerminal(m))
      .filter((m) => (m.plannedDate && m.plannedDate > today) || (m.deadline && m.deadline > today))
      .map((m) => ({ ...m }));
  },

  /**
   * "Hoje" — never simply `deadline == today` (spec "HOJE"). Manually-focused ids come from the
   * caller (Ritmo Diário's `DailyPriority`/daily focus selection), since Missions never owns that
   * concept itself.
   */
  async getTodayMissions(manuallyFocusedIds: string[] = []): Promise<Mission[]> {
    const today = todayKey();
    return missionDb.missions
      .filter((m) =>
        shouldAppearInToday(m, {
          today,
          isScheduledToday: m.plannedDate === today && !!m.scheduledStartAt,
          isManuallyFocused: manuallyFocusedIds.includes(m.id),
          isFollowUpDue: m.followUpAt !== undefined && m.followUpAt <= today && m.status === 'waiting',
        }),
      )
      .map((m) => ({ ...m }));
  },

  async getMissionsScheduledForDate(date: string): Promise<Mission[]> {
    return missionDb.missions
      .filter((m) => m.plannedDate === date && m.status !== 'cancelled' && m.status !== 'archived')
      .map((m) => ({ ...m }));
  },

  /** Deterministic candidates for "Sugestões" — never auto-applied (spec "NÃO ADICIONAR AUTOMATICAMENTE"). */
  async getMissionSuggestions(options?: { focusGoalIds?: string[]; availableCapacityMinutes?: number }): Promise<MissionSuggestion[]> {
    return computeMissionSuggestions(missionDb.missions, missionDb.dependencies, {
      today: todayKey(),
      focusGoalIds: options?.focusGoalIds ?? [],
      availableCapacityMinutes: options?.availableCapacityMinutes,
    });
  },

  // ----------------------------------------------------
  // DEPENDENCIES
  // ----------------------------------------------------

  async addMissionDependency(blockerMissionId: string, blockedMissionId: string): Promise<MissionDependency> {
    const validation = validateNewDependency(blockerMissionId, blockedMissionId, missionDb.dependencies);
    if (!validation.valid) {
      throw new Error(`Invalid dependency (${validation.error}): ${blockerMissionId} -> ${blockedMissionId}`);
    }
    const dependency: MissionDependency = {
      id: generateId('dependency'),
      blockerMissionId,
      blockedMissionId,
      createdAt: nowIso(),
    };
    missionDb.dependencies.push(dependency);
    recordActivity(blockedMissionId, 'blocked', `Bloqueada por outra missão`);
    return { ...dependency };
  },

  async removeMissionDependency(dependencyId: string): Promise<void> {
    const dependency = missionDb.dependencies.find((d) => d.id === dependencyId);
    missionDb.dependencies = missionDb.dependencies.filter((d) => d.id !== dependencyId);
    if (dependency) {
      const statusById = buildStatusById();
      if (!isMissionBlocked(dependency.blockedMissionId, missionDb.dependencies, statusById)) {
        recordActivity(dependency.blockedMissionId, 'unblocked');
      }
    }
  },

  async getMissionDependencies(missionId: string): Promise<{ blockedBy: string[]; blocks: string[]; isBlocked: boolean }> {
    const statusById = buildStatusById();
    return {
      blockedBy: getBlockerIds(missionId, missionDb.dependencies),
      blocks: getBlockedIds(missionId, missionDb.dependencies),
      isBlocked: isMissionBlocked(missionId, missionDb.dependencies, statusById),
    };
  },

  async getOpenBlockerCount(missionId: string): Promise<number> {
    const statusById = buildStatusById();
    return getOpenBlockerIds(missionId, missionDb.dependencies, statusById).length;
  },

  // ----------------------------------------------------
  // ACTIVITY & ANALYTICS
  // ----------------------------------------------------

  async getMissionActivity(missionId: string): Promise<MissionActivity[]> {
    return missionDb.activity
      .filter((a) => a.missionId === missionId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getMissionAnalytics(): Promise<MissionAnalyticsOverview> {
    return getMissionAnalyticsOverview(missionDb.missions, missionDb.projects, todayKey());
  },

  async isMissionOverdue(mission: Mission): Promise<boolean> {
    return isMissionOverdue(mission, todayKey());
  },

  async isMissionAvailable(mission: Mission): Promise<boolean> {
    return isMissionAvailable(mission, todayKey());
  },
};
