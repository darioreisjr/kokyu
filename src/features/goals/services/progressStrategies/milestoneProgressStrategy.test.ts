import { describe, expect, it } from 'vitest';

import type { Goal, GoalMilestone } from '../../types';
import { calculateMilestoneProgress } from './milestoneProgressStrategy';

function buildGoal(milestones: GoalMilestone[]): Goal {
  return {
    id: 'goal-1',
    title: 'Construir meu app',
    area: 'personal',
    type: 'milestone',
    status: 'onTrack',
    systemStatus: 'onTrack',
    priority: 'medium',
    measurement: { type: 'milestone' },
    progressMode: 'manual',
    startDate: '2026-01-01',
    milestones,
    tags: [],
    checkInFrequency: 'none',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('calculateMilestoneProgress', () => {
  it('splits weight equally across 4 milestones, 2 completed → 50%', () => {
    const milestones: GoalMilestone[] = [0, 1, 2, 3].map((index) => ({
      id: `m${index}`,
      title: `Marco ${index}`,
      completed: index < 2,
      order: index,
    }));
    expect(calculateMilestoneProgress(buildGoal(milestones)).percent).toBe(50);
  });

  it('uses explicit weights when every milestone has one', () => {
    const milestones: GoalMilestone[] = [
      { id: 'a', title: 'Milestone A', completed: true, order: 0, weight: 70 },
      { id: 'b', title: 'Milestone B', completed: false, order: 1, weight: 30 },
    ];
    expect(calculateMilestoneProgress(buildGoal(milestones)).percent).toBe(70);
  });

  it('returns 0% for a goal with no milestones yet', () => {
    expect(calculateMilestoneProgress(buildGoal([])).percent).toBe(0);
  });

  it('falls back to equal weight when only some milestones have one', () => {
    const milestones: GoalMilestone[] = [
      { id: 'a', title: 'A', completed: true, order: 0, weight: 70 },
      { id: 'b', title: 'B', completed: false, order: 1 },
    ];
    expect(calculateMilestoneProgress(buildGoal(milestones)).percent).toBe(50);
  });

  it('returns 0% rather than dividing by zero when every milestone is weighted at 0', () => {
    const milestones: GoalMilestone[] = [
      { id: 'a', title: 'A', completed: true, order: 0, weight: 0 },
      { id: 'b', title: 'B', completed: false, order: 1, weight: 0 },
    ];
    expect(calculateMilestoneProgress(buildGoal(milestones)).percent).toBe(0);
  });
});
