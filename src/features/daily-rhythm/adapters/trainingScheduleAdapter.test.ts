import { beforeEach, describe, expect, it } from 'vitest';
import { trainingDb } from '@/features/training/services/trainingMockDb';
import { trainingScheduleService } from '@/features/training/services/trainingScheduleService';
import { trainingScheduleAdapter } from './trainingScheduleAdapter';

describe('trainingScheduleAdapter', () => {
  beforeEach(() => {
    trainingDb.scheduleEntries = [];
  });

  it('fetches and converts training entries into ScheduleEntry', async () => {
    const entry = await trainingScheduleService.scheduleWorkout({
      date: '2026-08-31',
      time: '19:00',
      label: 'Push A - Peito e Tríceps',
      estimatedDurationMinutes: 60,
      recurrence: 'once',
    });

    const entries = await trainingScheduleAdapter.getEntriesForDate('2026-08-31');
    expect(entries).toHaveLength(1);
    expect(entries[0]!.title).toBe('Push A - Peito e Tríceps');
    expect(entries[0]!.sourceType).toBe('training');
    expect(entries[0]!.sourceId).toBe(entry.id);
    expect(entries[0]!.startAt).toBe('19:00');
    expect(entries[0]!.endAt).toBe('20:00');
    expect(entries[0]!.locked).toBe(true);
  });

  it('syncs reschedule back to trainingScheduleService', async () => {
    await trainingScheduleService.scheduleWorkout({
      date: '2026-08-31',
      time: '19:00',
      label: 'Pull A',
      recurrence: 'once',
    });

    const [schedEntry] = await trainingScheduleAdapter.getEntriesForDate('2026-08-31');
    expect(schedEntry).toBeDefined();

    const success = await trainingScheduleAdapter.onEntryRescheduled!(schedEntry!, '2026-09-01', '20:00');
    expect(success).toBe(true);

    const oldDateEntries = await trainingScheduleAdapter.getEntriesForDate('2026-08-31');
    expect(oldDateEntries).toHaveLength(0);

    const newDateEntries = await trainingScheduleAdapter.getEntriesForDate('2026-09-01');
    expect(newDateEntries).toHaveLength(1);
    expect(newDateEntries[0]!.date).toBe('2026-09-01');
  });
});

