import { beforeEach, describe, expect, it } from 'vitest';
import { missionService } from '@/features/missions/services/missionService';
import { todayKey } from '@/features/missions/utils/missionDateKey';
import { missionScheduleAdapter, resetMissionDb } from './missionScheduleAdapter';

describe('missionScheduleAdapter', () => {
  beforeEach(() => {
    resetMissionDb();
  });

  it('fetches mission entries for date and supports completion', async () => {
    const today = todayKey();
    const entries = await missionScheduleAdapter.getEntriesForDate(today);
    expect(entries.length).toBeGreaterThanOrEqual(1);

    const first = entries[0]!;
    expect(first.sourceType).toBe('mission');
    expect(first.status).toBe('planned');

    await missionScheduleAdapter.onEntryCompleted!(first);
    const updated = await missionScheduleAdapter.getEntriesForDate(today);
    expect(updated[0]!.status).toBe('completed');
  });

  it('rescheduling a mission never changes its deadline', async () => {
    const today = todayKey();
    const before = await missionService.getMission('mission-monthly-report');
    const deadlineBefore = before!.deadline;

    const entries = await missionScheduleAdapter.getEntriesForDate(today);
    const entry = entries.find((e) => e.sourceId === 'mission-monthly-report')!;
    await missionScheduleAdapter.onEntryRescheduled!(entry, '2026-12-25', '09:00');

    const after = await missionService.getMission('mission-monthly-report');
    expect(after!.plannedDate).toBe('2026-12-25');
    expect(after!.scheduledStartAt).toBe('09:00');
    expect(after!.deadline).toBe(deadlineBefore);
  });

  it('removing a schedule entry keeps the mission (only clears the schedule)', async () => {
    const today = todayKey();
    const entries = await missionScheduleAdapter.getEntriesForDate(today);
    const entry = entries.find((e) => e.sourceId === 'mission-monthly-report')!;

    const removed = await missionScheduleAdapter.onEntryDeleted!(entry);
    expect(removed).toBe(true);

    const mission = await missionService.getMission('mission-monthly-report');
    expect(mission).not.toBeNull();
    expect(mission!.plannedDate).toBeUndefined();
  });

  it('getUnscheduledEntries only returns entries without a start time', async () => {
    const today = todayKey();
    await missionService.scheduleMission('mission-backlog-1', today);

    const unscheduled = await missionScheduleAdapter.getUnscheduledEntries!(today);
    expect(unscheduled.some((e) => e.sourceId === 'mission-backlog-1')).toBe(true);
    expect(unscheduled.every((e) => !e.startAt)).toBe(true);
  });
});
