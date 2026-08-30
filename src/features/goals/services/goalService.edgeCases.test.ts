import { beforeEach, describe, expect, it } from 'vitest';

import { resetGoalDb } from './goalMockDb';
import { goalService } from './goalService';

const MISSING_ID = 'goal-does-not-exist';

beforeEach(() => {
  resetGoalDb();
});

describe('goalService — operations on a goal that does not exist', () => {
  it('every mutator returns null/void instead of throwing', async () => {
    await expect(goalService.getGoal(MISSING_ID)).resolves.toBeNull();
    await expect(goalService.updateGoal(MISSING_ID, {})).resolves.toBeNull();
    await expect(goalService.archiveGoal(MISSING_ID)).resolves.toBeNull();
    await expect(goalService.pauseGoal(MISSING_ID)).resolves.toBeNull();
    await expect(goalService.resumeGoal(MISSING_ID)).resolves.toBeNull();
    await expect(goalService.replanGoal(MISSING_ID, '2027-01-01')).resolves.toBeNull();
    await expect(goalService.completeGoal(MISSING_ID)).resolves.toBeNull();
    await expect(goalService.reopenGoal(MISSING_ID)).resolves.toBeNull();
    await expect(goalService.abandonGoal(MISSING_ID, 'other')).resolves.toBeNull();
    await expect(goalService.duplicateGoal(MISSING_ID)).resolves.toBeNull();
    await expect(goalService.addMilestone(MISSING_ID, { title: 'X' })).resolves.toBeNull();
    await expect(goalService.completeMilestone(MISSING_ID, 'm1')).resolves.toBeNull();
    await expect(goalService.reorderMilestones(MISSING_ID, [])).resolves.toBeNull();
    await expect(
      goalService.addKeyResult(MISSING_ID, {
        title: 'KR',
        type: 'numeric',
        baseline: 0,
        current: 0,
        target: 1,
        unit: 'units',
      }),
    ).resolves.toBeNull();
    await expect(
      goalService.updateKeyResult(MISSING_ID, 'kr1', { current: 1 }),
    ).resolves.toBeNull();
    await expect(goalService.deleteGoal(MISSING_ID)).resolves.toBeUndefined();
  });

  it('unlinking a link that does not exist is a safe no-op', async () => {
    await expect(
      goalService.unlinkGoalEntity(MISSING_ID, 'link-does-not-exist'),
    ).resolves.toBeUndefined();
  });
});

describe('goalService — updateGoal activity logging', () => {
  it('logs a deadlineChanged activity only when the target date actually changes', async () => {
    const goal = await goalService.createGoal({
      title: 'Meta com prazo',
      area: 'personal',
      type: 'numeric',
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
      targetDate: '2026-06-01',
      tags: [],
      checkInFrequency: 'none',
    });

    await goalService.updateGoal(goal.id, { targetDate: '2026-06-01' });
    let activities = await goalService.getGoalActivities(goal.id);
    expect(activities.some((activity) => activity.type === 'deadlineChanged')).toBe(false);

    await goalService.updateGoal(goal.id, { targetDate: '2026-09-01' });
    activities = await goalService.getGoalActivities(goal.id);
    expect(activities.some((activity) => activity.type === 'deadlineChanged')).toBe(true);
  });

  it('logs a targetChanged activity when a numeric goal target is updated', async () => {
    const goal = await goalService.createGoal({
      title: 'Meta numérica',
      area: 'personal',
      type: 'numeric',
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
    });

    await goalService.updateGoal(goal.id, {
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'units',
        baseline: 0,
        currentValue: 0,
        targetValue: 20,
      },
    });
    const activities = await goalService.getGoalActivities(goal.id);
    expect(activities.some((activity) => activity.type === 'targetChanged')).toBe(true);
  });
});

describe('goalService — notes and reflections', () => {
  it('adds and retrieves notes for a goal', async () => {
    const goal = await goalService.createGoal({
      title: 'Meta com notas',
      area: 'personal',
      type: 'binary',
      priority: 'medium',
      measurement: { type: 'binary', completed: false },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
    });

    await goalService.addGoalNote(goal.id, 'Uma ideia');
    const notes = await goalService.getGoalNotes(goal.id);
    expect(notes).toHaveLength(1);
    expect(notes[0]!.text).toBe('Uma ideia');
  });

  it('returns an empty reflection list for a goal with none yet', async () => {
    const goal = await goalService.createGoal({
      title: 'Meta sem reflexão',
      area: 'personal',
      type: 'binary',
      priority: 'medium',
      measurement: { type: 'binary', completed: false },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
    });
    await expect(goalService.getGoalReflections(goal.id)).resolves.toEqual([]);
  });
});
