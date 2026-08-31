import { describe, expect, it } from 'vitest';
import type { Habit } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';
import { calculateDailyHabitScore } from './habitProgressEngine';

const habit1: Habit = {
  id: 'h-1',
  name: 'Hábito 1',
  area: 'routine',
  direction: 'build',
  trackingType: 'binary',
  status: 'active',
  target: { type: 'binary' },
  schedule: { frequencyType: 'daily', effectiveFrom: '2026-01-01' },
  reminders: [],
  timeOfDay: 'morning',
  startDate: '2026-01-01',
  icon: 'Check',
  tags: [],
  source: 'manual',
  goalIds: [],
  routineIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const habit2: Habit = {
  id: 'h-2',
  name: 'Hábito 2',
  area: 'routine',
  direction: 'build',
  trackingType: 'binary',
  status: 'active',
  target: { type: 'binary' },
  schedule: { frequencyType: 'daily', effectiveFrom: '2026-01-01' },
  reminders: [],
  timeOfDay: 'evening',
  startDate: '2026-01-01',
  icon: 'Check',
  tags: [],
  source: 'manual',
  goalIds: [],
  routineIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('habitProgressEngine', () => {
  it('calculates daily score using only habits scheduled for that day', () => {
    const logs: HabitLog[] = [
      {
        id: 'l1',
        habitId: 'h-1',
        date: '2026-02-15',
        timestamp: '2026-02-15T08:00:00.000Z',
        status: 'completed',
        value: 1,
        source: 'manual',
        createdAt: '2026-02-15T08:00:00.000Z',
        updatedAt: '2026-02-15T08:00:00.000Z',
      },
    ];

    const score = calculateDailyHabitScore([habit1, habit2], '2026-02-15', logs, '2026-02-15');
    expect(score.scheduledCount).toBe(2);
    expect(score.completedCount).toBe(1);
    expect(score.scorePercent).toBe(50);
  });

  it('treats skipped habit as neutral and excludes it from score denominator', () => {
    const logs: HabitLog[] = [
      {
        id: 'l1',
        habitId: 'h-1',
        date: '2026-02-15',
        timestamp: '2026-02-15T08:00:00.000Z',
        status: 'completed',
        value: 1,
        source: 'manual',
        createdAt: '2026-02-15T08:00:00.000Z',
        updatedAt: '2026-02-15T08:00:00.000Z',
      },
      {
        id: 'l2',
        habitId: 'h-2',
        date: '2026-02-15',
        timestamp: '2026-02-15T08:00:00.000Z',
        status: 'skipped',
        value: 0,
        source: 'manual',
        createdAt: '2026-02-15T08:00:00.000Z',
        updatedAt: '2026-02-15T08:00:00.000Z',
      },
    ];

    const score = calculateDailyHabitScore([habit1, habit2], '2026-02-15', logs, '2026-02-15');
    expect(score.scheduledCount).toBe(2);
    expect(score.skippedCount).toBe(1);
    expect(score.completedCount).toBe(1);
    // 1 completed / (2 scheduled - 1 skipped) = 100%
    expect(score.scorePercent).toBe(100);
  });
});
