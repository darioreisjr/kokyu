import { describe, expect, it } from 'vitest';

import type { Goal } from '../types';
import { filterGoals, isGoalDueSoon, isGoalStale, sortGoals } from './goalFilters';

function buildGoal(overrides: Partial<Goal>): Goal {
  return {
    id: overrides.id ?? 'goal-1',
    title: 'Meta',
    area: 'personal',
    type: 'numeric',
    status: 'onTrack',
    systemStatus: 'onTrack',
    priority: 'medium',
    measurement: {
      type: 'numeric',
      direction: 'increase',
      unit: 'units',
      baseline: 0,
      currentValue: 0,
      targetValue: 10,
    },
    progressMode: 'manual',
    startDate: '2026-01-01',
    tags: [],
    checkInFrequency: 'none',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('filterGoals', () => {
  const goals = [
    buildGoal({
      id: 'a',
      title: 'Ler 20 livros',
      area: 'leisure',
      priority: 'focus',
      status: 'onTrack',
      tags: ['leitura'],
    }),
    buildGoal({
      id: 'b',
      title: 'Treinar mais',
      area: 'training',
      priority: 'medium',
      status: 'atRisk',
      progressMode: 'automatic',
    }),
    buildGoal({
      id: 'c',
      title: 'Aprender violão',
      area: 'leisure',
      priority: 'low',
      status: 'attention',
    }),
  ];

  it('filters by free-text search across title and tags', () => {
    expect(filterGoals(goals, { search: 'livros' }).map((goal) => goal.id)).toEqual(['a']);
    expect(filterGoals(goals, { search: 'leitura' }).map((goal) => goal.id)).toEqual(['a']);
  });

  it('is accent-insensitive', () => {
    expect(filterGoals(goals, { search: 'violao' }).map((goal) => goal.id)).toEqual(['c']);
  });

  it('filters by area', () => {
    expect(
      filterGoals(goals, { area: 'leisure' })
        .map((goal) => goal.id)
        .sort(),
    ).toEqual(['a', 'c']);
  });

  it('filters by quick filter "focus"', () => {
    expect(filterGoals(goals, { quickFilter: 'focus' }).map((goal) => goal.id)).toEqual(['a']);
  });

  it('filters by source', () => {
    expect(filterGoals(goals, { source: 'automatic' }).map((goal) => goal.id)).toEqual(['b']);
  });
});

describe('sortGoals', () => {
  it('sorts by priority — focus first', () => {
    const goals = [
      buildGoal({ id: 'low', priority: 'low' }),
      buildGoal({ id: 'focus', priority: 'focus' }),
      buildGoal({ id: 'high', priority: 'high' }),
    ];
    expect(sortGoals(goals, 'priority').map((goal) => goal.id)).toEqual(['focus', 'high', 'low']);
  });

  it('sorts by progress using the provided percent map', () => {
    const goals = [buildGoal({ id: 'a' }), buildGoal({ id: 'b' }), buildGoal({ id: 'c' })];
    expect(sortGoals(goals, 'progress', { a: 20, b: 90, c: 50 }).map((goal) => goal.id)).toEqual([
      'b',
      'c',
      'a',
    ]);
  });

  it('sorts by risk — atRisk before attention before onTrack', () => {
    const goals = [
      buildGoal({ id: 'ok', status: 'onTrack' }),
      buildGoal({ id: 'risk', status: 'atRisk' }),
      buildGoal({ id: 'att', status: 'attention' }),
    ];
    expect(sortGoals(goals, 'risk').map((goal) => goal.id)).toEqual(['risk', 'att', 'ok']);
  });

  it('sorts by deadline, goals with no deadline last', () => {
    const goals = [
      buildGoal({ id: 'none', targetDate: undefined }),
      buildGoal({ id: 'soon', targetDate: '2026-02-01' }),
      buildGoal({ id: 'later', targetDate: '2026-06-01' }),
    ];
    expect(sortGoals(goals, 'deadline').map((goal) => goal.id)).toEqual(['soon', 'later', 'none']);
  });

  it('sorts by last updated, most recent first', () => {
    const goals = [
      buildGoal({ id: 'old', updatedAt: '2026-01-01T00:00:00.000Z' }),
      buildGoal({ id: 'new', updatedAt: '2026-06-01T00:00:00.000Z' }),
    ];
    expect(sortGoals(goals, 'updated').map((goal) => goal.id)).toEqual(['new', 'old']);
  });

  it('sorts by title, pt-BR alphabetical order', () => {
    const goals = [buildGoal({ id: 'b', title: 'Zebra' }), buildGoal({ id: 'a', title: 'Água' })];
    expect(sortGoals(goals, 'title').map((goal) => goal.id)).toEqual(['a', 'b']);
  });
});

describe('isGoalStale', () => {
  it('flags a manual goal with no recent activity', () => {
    const goal = buildGoal({ progressMode: 'manual', createdAt: '2026-01-01T00:00:00.000Z' });
    expect(isGoalStale(goal, new Date('2026-02-01T00:00:00.000Z'))).toBe(true);
  });

  it('never flags an automatic goal as stale', () => {
    const goal = buildGoal({ progressMode: 'automatic', createdAt: '2026-01-01T00:00:00.000Z' });
    expect(isGoalStale(goal, new Date('2026-02-01T00:00:00.000Z'))).toBe(false);
  });
});

describe('isGoalDueSoon', () => {
  it('flags a goal whose deadline is within the window', () => {
    const goal = buildGoal({ targetDate: '2026-01-10' });
    expect(isGoalDueSoon(goal, new Date('2026-01-01T00:00:00.000Z'))).toBe(true);
  });

  it('does not flag a goal with no deadline', () => {
    const goal = buildGoal({ targetDate: undefined });
    expect(isGoalDueSoon(goal, new Date('2026-01-01T00:00:00.000Z'))).toBe(false);
  });
});
