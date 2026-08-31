import { describe, expect, it } from 'vitest';
import type { Habit } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';
import { deriveHabitOccurrence } from './habitOccurrenceService';

const baseHabit: Habit = {
  id: 'h-water',
  name: 'Beber 2L de água',
  area: 'nutrition',
  direction: 'build',
  trackingType: 'quantity',
  status: 'active',
  target: { type: 'quantity', targetValue: 2000, unit: 'units', customUnitLabel: 'ml' },
  schedule: { frequencyType: 'daily', effectiveFrom: '2026-01-01' },
  reminders: [],
  timeOfDay: 'anytime',
  startDate: '2026-01-01',
  icon: 'Restaurant',
  tags: [],
  source: 'manual',
  goalIds: [],
  routineIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('habitOccurrenceService', () => {
  it('derives completed status when logged value meets target', () => {
    const logs: HabitLog[] = [
      {
        id: 'l1',
        habitId: 'h-water',
        date: '2026-02-15',
        timestamp: '2026-02-15T10:00:00.000Z',
        status: 'completed',
        value: 2000,
        source: 'manual',
        createdAt: '2026-02-15T10:00:00.000Z',
        updatedAt: '2026-02-15T10:00:00.000Z',
      },
    ];

    const occ = deriveHabitOccurrence(baseHabit, '2026-02-15', logs, '2026-02-15');
    expect(occ.status).toBe('completed');
    expect(occ.loggedValue).toBe(2000);
    expect(occ.progressPercent).toBe(100);
  });

  it('marks past unlogged days as missed without creating fake database records', () => {
    const occ = deriveHabitOccurrence(baseHabit, '2026-02-10', [], '2026-02-15');
    expect(occ.status).toBe('missed');
    expect(occ.loggedValue).toBe(0);
  });

  it('correctly handles neutral skipped occurrences', () => {
    const logs: HabitLog[] = [
      {
        id: 'l2',
        habitId: 'h-water',
        date: '2026-02-15',
        timestamp: '2026-02-15T10:00:00.000Z',
        status: 'skipped',
        value: 0,
        source: 'manual',
        createdAt: '2026-02-15T10:00:00.000Z',
        updatedAt: '2026-02-15T10:00:00.000Z',
      },
    ];

    const occ = deriveHabitOccurrence(baseHabit, '2026-02-15', logs, '2026-02-15');
    expect(occ.status).toBe('skipped');
  });
});
