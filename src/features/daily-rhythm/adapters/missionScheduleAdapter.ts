import type { Mission } from '@/features/missions/types';
import { missionService } from '@/features/missions/services/missionService';
import { resetMissionDb } from '@/features/missions/services/missionMockDb';
import type { ScheduleEntry, ScheduleSourceAdapter } from '@/shared/scheduling/types';
import { addMinutesToTime } from '@/shared/scheduling/utils/timeHelpers';

export { resetMissionDb };

function toSchedulePriority(priority: Mission['priority']): ScheduleEntry['priority'] {
  if (priority === 'critical') return 'focus';
  if (priority === 'high') return 'high';
  if (priority === 'medium') return 'medium';
  return 'low';
}

function toScheduleEntry(mission: Mission, date: string): ScheduleEntry {
  const duration = mission.estimatedDuration ?? 30;
  const startAt = mission.scheduledStartAt;
  const endAt = startAt ? addMinutesToTime(startAt, duration) : undefined;

  return {
    id: `mission-${mission.id}`,
    sourceType: 'mission',
    sourceId: mission.id,
    title: mission.title,
    description: mission.description,
    date,
    startAt,
    endAt,
    duration,
    allDay: false,
    flexible: !startAt,
    locked: false,
    splittable: mission.splittable,
    minChunkDuration: mission.minimumChunkDuration,
    status: mission.status === 'completed' ? 'completed' : 'planned',
    priority: toSchedulePriority(mission.priority),
    context: 'work',
    colorToken: 'schedule.source.mission',
    icon: 'AssignmentRounded',
    syncMode: 'bidirectional',
    createdAt: mission.createdAt,
    updatedAt: mission.updatedAt,
  };
}

/**
 * `features/missions` exists — reads/writes the real `missionService` (daily-rhythm is a
 * documented exception to "features never import features", the same precedent
 * `habitScheduleAdapter`/`candidateProviders.ts` already use for `habitService`). A mission "has a
 * ScheduleEntry" once `plannedDate` is set; it additionally "has a time" once `scheduledStartAt`
 * is set — see `docs/missions.md#scheduling`.
 */
export const missionScheduleAdapter: ScheduleSourceAdapter = {
  sourceType: 'mission',
  label: 'Missões',

  async getEntriesForDate(date: string): Promise<ScheduleEntry[]> {
    const missions = await missionService.getMissionsScheduledForDate(date);
    return missions.map((mission) => toScheduleEntry(mission, date));
  },

  async getUnscheduledEntries(date: string): Promise<ScheduleEntry[]> {
    const entries = await missionScheduleAdapter.getEntriesForDate(date);
    return entries.filter((entry) => !entry.startAt && entry.status === 'planned');
  },

  async onEntryCompleted(entry: ScheduleEntry): Promise<boolean> {
    const updated = await missionService.completeMission(entry.sourceId);
    return updated !== null;
  },

  async onEntryRescheduled(entry: ScheduleEntry, newDate: string, newStartAt?: string): Promise<boolean> {
    const updated = await missionService.scheduleMission(entry.sourceId, newDate, newStartAt);
    return updated !== null;
  },

  async onEntryDeleted(entry: ScheduleEntry): Promise<boolean> {
    const updated = await missionService.unscheduleMission(entry.sourceId);
    return updated !== null;
  },
};
