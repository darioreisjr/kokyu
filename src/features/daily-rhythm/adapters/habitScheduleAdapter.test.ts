import { beforeEach, describe, expect, it } from 'vitest';
import { resetHabitDb } from '@/features/habits/services/habitMockDb';
import { habitService } from '@/features/habits/services/habitService';
import { habitScheduleAdapter } from './habitScheduleAdapter';

describe('habitScheduleAdapter', () => {
  beforeEach(() => {
    resetHabitDb();
  });

  it('projects daily habits into ScheduleEntry', async () => {
    const habit = await habitService.createHabit({
      name: 'Meditação Matinal',
      area: 'personal',
      direction: 'build',
      trackingType: 'binary',
      status: 'active',
      target: { type: 'binary' },
      schedule: { frequencyType: 'daily', effectiveFrom: '2026-08-01' },
      reminders: [],
      timeOfDay: 'morning',
      preferredTime: '07:00',
      estimatedDurationMinutes: 20,
      startDate: '2026-08-01',
      tags: [],
      icon: 'SelfImprovementRounded',
      source: 'manual',
      goalIds: [],
      routineIds: [],
    });

    const entries = await habitScheduleAdapter.getEntriesForDate('2026-08-31');
    const medEntry = entries.find((e) => e.sourceId === habit.id);

    expect(medEntry).toBeDefined();
    expect(medEntry?.title).toBe('Meditação Matinal');
    expect(medEntry?.startAt).toBe('07:00');
    expect(medEntry?.duration).toBe(20);
    expect(medEntry?.sourceType).toBe('habit');
  });

  it('marks habit completed via adapter and logs into habitService', async () => {
    await habitService.createHabit({
      name: 'Leitura 20 min',
      area: 'personal',
      direction: 'build',
      trackingType: 'binary',
      status: 'active',
      target: { type: 'binary' },
      schedule: { frequencyType: 'daily', effectiveFrom: '2026-08-01' },
      reminders: [],
      timeOfDay: 'evening',
      startDate: '2026-08-01',
      tags: [],
      icon: 'MenuBookRounded',
      source: 'manual',
      goalIds: [],
      routineIds: [],
    });

    const [entry] = await habitScheduleAdapter.getEntriesForDate('2026-08-31');
    expect(entry).toBeDefined();

    await habitScheduleAdapter.onEntryCompleted!(entry!);
    const logs = await habitService.getHabitLogs(entry!.sourceId);
    expect(logs.some((l) => l.date === '2026-08-31' && l.status === 'completed')).toBe(true);
  });
});

