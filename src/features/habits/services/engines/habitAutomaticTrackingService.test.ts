import { describe, expect, it } from 'vitest';
import type { HabitSourceEvent } from '../../types/adapters.types';
import type { Habit } from '../../types/habit.types';
import {
  findHabitsForSourceEvent,
  processSourceEvent,
} from './habitAutomaticTrackingService';

const trainingHabit: Habit = {
  id: 'h-auto-train',
  name: 'Treino de Força',
  area: 'training',
  direction: 'build',
  trackingType: 'count',
  status: 'active',
  target: { type: 'count', targetValue: 1 },
  schedule: { frequencyType: 'daily', effectiveFrom: '2026-01-01' },
  reminders: [],
  timeOfDay: 'afternoon',
  startDate: '2026-01-01',
  icon: 'FitnessCenter',
  tags: [],
  source: 'training',
  sourceRef: {
    module: 'training',
    metricId: 'training.workoutCompleted',
    autoLog: true,
  },
  goalIds: [],
  routineIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('habitAutomaticTrackingService', () => {
  it('finds matching auto-tracking habits for incoming module events', () => {
    const habits = [trainingHabit];
    const matches = findHabitsForSourceEvent(habits, 'training', 'training.workoutCompleted');
    expect(matches).toHaveLength(1);
    expect(matches[0]?.id).toBe('h-auto-train');
  });

  it('ensures strict idempotency using sourceEventId to prevent double counting', () => {
    const event: HabitSourceEvent = {
      sourceEventId: 'evt-workout-12345',
      module: 'training',
      metricId: 'training.workoutCompleted',
      value: 1,
      date: '2026-02-15',
      timestamp: '2026-02-15T18:00:00.000Z',
    };

    const firstRun = processSourceEvent(event, trainingHabit, []);
    expect(firstRun.isDuplicate).toBe(false);
    expect(firstRun.log.sourceEventId).toBe('evt-workout-12345');

    const secondRun = processSourceEvent(event, trainingHabit, [firstRun.log]);
    expect(secondRun.isDuplicate).toBe(true);
  });
});
