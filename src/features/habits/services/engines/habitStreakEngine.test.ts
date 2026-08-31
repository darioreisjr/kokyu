import { describe, expect, it } from 'vitest';
import type { Habit } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';
import { calculateHabitStreak } from './habitStreakEngine';

const dailyHabit: Habit = {
  id: 'h-streak',
  name: 'Meditação Diária',
  area: 'personal',
  direction: 'build',
  trackingType: 'duration',
  status: 'active',
  target: { type: 'duration', targetMinutes: 10 },
  schedule: { frequencyType: 'daily', effectiveFrom: '2026-02-01' },
  reminders: [],
  timeOfDay: 'morning',
  startDate: '2026-02-01',
  icon: 'SelfImprovement',
  tags: [],
  source: 'manual',
  goalIds: [],
  routineIds: [],
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

describe('habitStreakEngine', () => {
  it('calculates daily streaks correctly with neutral skips not breaking streaks', () => {
    const logs: HabitLog[] = [
      {
        id: 'l1',
        habitId: 'h-streak',
        date: '2026-02-15',
        timestamp: '2026-02-15T07:00:00.000Z',
        status: 'completed',
        value: 10,
        source: 'manual',
        createdAt: '2026-02-15T07:00:00.000Z',
        updatedAt: '2026-02-15T07:00:00.000Z',
      },
      {
        id: 'l2',
        habitId: 'h-streak',
        date: '2026-02-14',
        timestamp: '2026-02-14T07:00:00.000Z',
        status: 'skipped',
        value: 0,
        source: 'manual',
        createdAt: '2026-02-14T07:00:00.000Z',
        updatedAt: '2026-02-14T07:00:00.000Z',
      },
      {
        id: 'l3',
        habitId: 'h-streak',
        date: '2026-02-13',
        timestamp: '2026-02-13T07:00:00.000Z',
        status: 'completed',
        value: 10,
        source: 'manual',
        createdAt: '2026-02-13T07:00:00.000Z',
        updatedAt: '2026-02-13T07:00:00.000Z',
      },
    ];

    const streak = calculateHabitStreak(dailyHabit, logs, '2026-02-15');
    expect(streak.currentStreak).toBe(2);
    expect(streak.periodUnit).toBe('days');
  });

  it('calculates weekly streaks for flexible weekly habits (X times per week)', () => {
    const flexHabit: Habit = {
      ...dailyHabit,
      schedule: {
        frequencyType: 'flexibleWeekly',
        timesPerPeriod: 3,
        effectiveFrom: '2026-02-01',
      },
    };

    // 3 logs in week 1 (Feb 9 to Feb 15)
    const logs: HabitLog[] = [
      {
        id: 'l1',
        habitId: 'h-streak',
        date: '2026-02-09',
        timestamp: '2026-02-09T07:00:00.000Z',
        status: 'completed',
        value: 10,
        source: 'manual',
        createdAt: '2026-02-09T07:00:00.000Z',
        updatedAt: '2026-02-09T07:00:00.000Z',
      },
      {
        id: 'l2',
        habitId: 'h-streak',
        date: '2026-02-11',
        timestamp: '2026-02-11T07:00:00.000Z',
        status: 'completed',
        value: 10,
        source: 'manual',
        createdAt: '2026-02-11T07:00:00.000Z',
        updatedAt: '2026-02-11T07:00:00.000Z',
      },
      {
        id: 'l3',
        habitId: 'h-streak',
        date: '2026-02-13',
        timestamp: '2026-02-13T07:00:00.000Z',
        status: 'completed',
        value: 10,
        source: 'manual',
        createdAt: '2026-02-13T07:00:00.000Z',
        updatedAt: '2026-02-13T07:00:00.000Z',
      },
    ];

    const streak = calculateHabitStreak(flexHabit, logs, '2026-02-15');
    expect(streak.currentStreak).toBe(1);
    expect(streak.periodUnit).toBe('weeks');
  });
});
