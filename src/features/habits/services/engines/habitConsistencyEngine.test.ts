import { describe, expect, it } from 'vitest';
import type { Habit } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';
import { calculateHabitConsistencyScore } from './habitConsistencyEngine';

const habit: Habit = {
  id: 'h-cons',
  name: 'Consistência',
  area: 'routine',
  direction: 'build',
  trackingType: 'binary',
  status: 'active',
  target: { type: 'binary' },
  schedule: { frequencyType: 'daily', effectiveFrom: '2026-01-01' },
  reminders: [],
  timeOfDay: 'anytime',
  startDate: '2026-01-01',
  icon: 'Check',
  tags: [],
  source: 'manual',
  goalIds: [],
  routineIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('habitConsistencyEngine', () => {
  it('calculates weighted consistency score over rolling window without hard cliff drop', () => {
    const logs: HabitLog[] = [];
    const today = '2026-02-15';

    // Log 28 out of 30 days completed
    for (let i = 0; i < 28; i++) {
      const d = new Date(2026, 1, 15 - i);
      const dateStr = d.toISOString().split('T')[0]!;
      logs.push({
        id: `l-${i}`,
        habitId: 'h-cons',
        date: dateStr,
        timestamp: `${dateStr}T10:00:00.000Z`,
        status: 'completed',
        value: 1,
        source: 'manual',
        createdAt: `${dateStr}T10:00:00.000Z`,
        updatedAt: `${dateStr}T10:00:00.000Z`,
      });
    }

    const consistency = calculateHabitConsistencyScore(habit, logs, today, 30);
    expect(consistency.score).toBeGreaterThan(90);
    expect(consistency.completedCount).toBe(28);
  });
});
