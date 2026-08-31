import { describe, expect, it } from 'vitest';
import type { Habit } from '../../types/habit.types';
import {
  getEffectiveScheduleAndTarget,
  isHabitPausedOnDate,
  isHabitScheduledOnDate,
} from './habitScheduleEngine';

const baseHabit: Habit = {
  id: 'h-1',
  name: 'Ler 20 páginas',
  area: 'leisure',
  direction: 'build',
  trackingType: 'quantity',
  status: 'active',
  target: { type: 'quantity', targetValue: 20, unit: 'pages' },
  schedule: {
    frequencyType: 'daily',
    startDate: '2026-01-01',
    effectiveFrom: '2026-01-01',
  },
  reminders: [],
  timeOfDay: 'evening',
  startDate: '2026-01-01',
  icon: 'MenuBook',
  tags: [],
  source: 'manual',
  goalIds: [],
  routineIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('habitScheduleEngine', () => {
  it('correctly identifies scheduled dates for daily habits', () => {
    expect(isHabitScheduledOnDate(baseHabit, '2026-02-15')).toBe(true);
  });

  it('correctly handles specific days of the week', () => {
    const specificHabit: Habit = {
      ...baseHabit,
      schedule: {
        frequencyType: 'specificDays',
        weekdays: [1, 3, 5], // Mon, Wed, Fri
        effectiveFrom: '2026-01-01',
      },
    };

    // 2026-02-16 is Monday (1), 2026-02-17 is Tuesday (2)
    expect(isHabitScheduledOnDate(specificHabit, '2026-02-16')).toBe(true);
    expect(isHabitScheduledOnDate(specificHabit, '2026-02-17')).toBe(false);
  });

  it('respects planned pauses without penalizing', () => {
    const pausedHabit: Habit = {
      ...baseHabit,
      plannedPause: {
        startDate: '2026-02-10',
        endDate: '2026-02-20',
        reason: 'Férias',
      },
    };

    expect(isHabitPausedOnDate(pausedHabit, '2026-02-15')).toBe(true);
    expect(isHabitScheduledOnDate(pausedHabit, '2026-02-15')).toBe(false);
    expect(isHabitPausedOnDate(pausedHabit, '2026-02-25')).toBe(false);
  });

  it('uses effective schedule version based on date without rewriting past records', () => {
    const versionedHabit: Habit = {
      ...baseHabit,
      target: { type: 'quantity', targetValue: 30, unit: 'pages' },
      schedule: { frequencyType: 'daily', effectiveFrom: '2026-02-01' },
      scheduleHistory: [
        {
          versionId: 'v1',
          effectiveFrom: '2026-01-01',
          effectiveUntil: '2026-01-31',
          schedule: { frequencyType: 'daily', effectiveFrom: '2026-01-01' },
          target: { type: 'quantity', targetValue: 15, unit: 'pages' },
        },
      ],
    };

    const past = getEffectiveScheduleAndTarget(versionedHabit, '2026-01-15');
    expect('targetValue' in past.target && past.target.targetValue).toBe(15);

    const current = getEffectiveScheduleAndTarget(versionedHabit, '2026-02-15');
    expect('targetValue' in current.target && current.target.targetValue).toBe(30);
  });
});
