import type { GoalProgressEntry } from '../types';

export function createMockGoalProgressEntries(): GoalProgressEntry[] {
  return [
    {
      id: 'progress-1',
      goalId: 'goal-reduce-screen-time',
      value: 165,
      date: '2026-06-15',
      source: 'manual',
      createdAt: '2026-06-15T21:00:00.000Z',
    },
    {
      id: 'progress-2',
      goalId: 'goal-reduce-screen-time',
      value: 150,
      date: '2026-07-15',
      source: 'manual',
      createdAt: '2026-07-15T21:00:00.000Z',
    },
    {
      id: 'progress-3',
      goalId: 'goal-reduce-screen-time',
      value: 140,
      date: '2026-08-18',
      note: 'Comecei a carregar o celular fora do quarto.',
      source: 'manual',
      createdAt: '2026-08-18T21:00:00.000Z',
    },
    {
      id: 'progress-4',
      goalId: 'goal-study-100-hours',
      value: 40,
      date: '2026-05-01',
      source: 'manual',
      createdAt: '2026-05-01T20:00:00.000Z',
    },
    {
      id: 'progress-5',
      goalId: 'goal-study-100-hours',
      value: 55,
      date: '2026-07-01',
      source: 'manual',
      createdAt: '2026-07-01T20:00:00.000Z',
    },
    {
      id: 'progress-6',
      goalId: 'goal-study-100-hours',
      value: 62,
      date: '2026-08-22',
      source: 'manual',
      createdAt: '2026-08-22T20:00:00.000Z',
    },
    {
      id: 'progress-7',
      goalId: 'goal-train-4x-week',
      value: 3,
      date: '2026-08-25',
      source: 'manual',
      createdAt: '2026-08-25T07:00:00.000Z',
    },
  ];
}
