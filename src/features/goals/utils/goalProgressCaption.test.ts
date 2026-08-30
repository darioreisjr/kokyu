import { describe, expect, it } from 'vitest';

import type { Goal } from '../types';
import { getGoalProgressCaption } from './goalProgressCaption';

function buildGoal(overrides: Partial<Goal>): Goal {
  return {
    id: 'goal-1',
    title: 'Meta',
    area: 'personal',
    type: 'numeric',
    status: 'onTrack',
    systemStatus: 'onTrack',
    priority: 'medium',
    measurement: {
      type: 'numeric',
      direction: 'increase',
      unit: 'books',
      baseline: 0,
      currentValue: 8,
      targetValue: 20,
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

describe('getGoalProgressCaption', () => {
  it('reads naturally for an increasing numeric goal', () => {
    const goal = buildGoal({});
    expect(
      getGoalProgressCaption(goal, { current: 8, target: 20, percent: 40, rawPercent: 40 }),
    ).toBe('Progresso: 8 de 20 livros, 40%.');
  });

  it('never implies an overshoot for a reduction goal, where the real value sits above a lower target', () => {
    const goal = buildGoal({
      measurement: {
        type: 'numeric',
        direction: 'decrease',
        unit: 'minutes',
        baseline: 180,
        currentValue: 140,
        targetValue: 90,
      },
    });
    const caption = getGoalProgressCaption(goal, {
      current: 140,
      target: 90,
      percent: 44,
      rawPercent: 44,
    });
    expect(caption).toContain('Atual: 140');
    expect(caption).toContain('Alvo: 90');
    expect(caption).not.toContain('140 de 90');
  });

  it('phrases a binary goal in terms of completion, not units', () => {
    const goal = buildGoal({ type: 'binary', measurement: { type: 'binary', completed: false } });
    expect(
      getGoalProgressCaption(goal, { current: 0, target: 100, percent: 0, rawPercent: 0 }),
    ).toBe('Ainda não concluída.');
  });

  it('phrases a milestone goal in terms of milestones, not the raw strategy numbers', () => {
    const goal = buildGoal({
      type: 'milestone',
      measurement: { type: 'milestone' },
      milestones: [
        { id: 'm1', title: 'A', completed: true, order: 0 },
        { id: 'm2', title: 'B', completed: false, order: 1 },
      ],
    });
    expect(
      getGoalProgressCaption(goal, { current: 1, target: 2, percent: 50, rawPercent: 50 }),
    ).toBe('1 de 2 marcos concluídos (50%).');
  });
});
