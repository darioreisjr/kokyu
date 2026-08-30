import { beforeEach, describe, expect, it } from 'vitest';

import { resetGoalDb } from './goalMockDb';
import { goalService } from './goalService';

beforeEach(() => {
  resetGoalDb();
});

describe('goalService — progress history', () => {
  it('records every update as its own entry instead of overwriting the current value silently', async () => {
    const goal = await goalService.createGoal({
      title: 'Estudar 100 horas',
      area: 'personal',
      type: 'numeric',
      priority: 'medium',
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'hours',
        baseline: 0,
        currentValue: 0,
        targetValue: 100,
      },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
    });

    await goalService.addProgress(goal.id, 25, '2026-02-01');
    const afterFirst = await goalService.getGoal(goal.id);
    expect(afterFirst?.measurement).toMatchObject({ currentValue: 25 });

    await goalService.addProgress(goal.id, 50, '2026-03-01');
    const afterSecond = await goalService.getGoal(goal.id);
    expect(afterSecond?.measurement).toMatchObject({ currentValue: 50 });

    const history = await goalService.getGoalProgress(goal.id);
    expect(history).toHaveLength(2);
    expect(history.map((entry) => entry.value)).toEqual([25, 50]);
  });
});

describe('goalService — milestones', () => {
  it('creates, completes, reopens and reorders milestones', async () => {
    const goal = await goalService.createGoal({
      title: 'Construir um projeto',
      area: 'personal',
      type: 'milestone',
      priority: 'medium',
      measurement: { type: 'milestone' },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
    });

    const first = await goalService.addMilestone(goal.id, { title: 'Primeiro marco' });
    const second = await goalService.addMilestone(goal.id, { title: 'Segundo marco' });
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();

    await goalService.completeMilestone(goal.id, first!.id, true);
    let updated = await goalService.getGoal(goal.id);
    expect(updated?.milestones?.find((m) => m.id === first!.id)?.completed).toBe(true);
    expect(updated?.status).toBe('onTrack');

    await goalService.completeMilestone(goal.id, first!.id, false);
    updated = await goalService.getGoal(goal.id);
    expect(updated?.milestones?.find((m) => m.id === first!.id)?.completed).toBe(false);

    await goalService.reorderMilestones(goal.id, [second!.id, first!.id]);
    updated = await goalService.getGoal(goal.id);
    const orderedTitles = [...(updated?.milestones ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((m) => m.title);
    expect(orderedTitles).toEqual(['Segundo marco', 'Primeiro marco']);
  });
});

describe('goalService — links', () => {
  it('never creates a duplicate link for the same entity', async () => {
    const goal = await goalService.createGoal({
      title: 'Publicar portfólio',
      area: 'work',
      type: 'binary',
      priority: 'medium',
      measurement: { type: 'binary', completed: false },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
    });

    const input = {
      entityType: 'mission' as const,
      entityId: 'mission-1',
      entityLabel: 'Criar design',
      relationshipType: 'contributesTo' as const,
    };
    const firstLink = await goalService.linkGoalEntity(goal.id, input);
    const secondLink = await goalService.linkGoalEntity(goal.id, input);
    expect(secondLink.id).toBe(firstLink.id);

    const links = await goalService.getGoalLinks(goal.id);
    expect(links).toHaveLength(1);

    await goalService.unlinkGoalEntity(goal.id, firstLink.id);
    expect(await goalService.getGoalLinks(goal.id)).toHaveLength(0);
  });
});

describe('goalService — check-ins', () => {
  it('stores the perceived status separately from the system status without overwriting it', async () => {
    const goal = await goalService.createGoal({
      title: 'Meta com check-in',
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
      checkInFrequency: 'weekly',
    });

    await goalService.createCheckIn(goal.id, { perceivedStatus: 'onTrack' });
    const updated = await goalService.getGoal(goal.id);
    expect(updated?.lastCheckInStatus).toBe('onTrack');
    expect(updated?.systemStatus).toBeDefined();
  });

  it('lists a goal as a pending check-in once its frequency interval has elapsed', async () => {
    const goal = await goalService.createGoal({
      title: 'Meta semanal',
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
      checkInFrequency: 'weekly',
    });

    // `createdAt` is "now" — 8 days later is safely past the weekly (7-day) interval.
    const eightDaysLater = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
    const pending = await goalService.getPendingCheckIns(eightDaysLater);
    expect(pending.some((entry) => entry.goal.id === goal.id)).toBe(true);

    const notYetDue = await goalService.getPendingCheckIns(
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );
    expect(notYetDue.some((entry) => entry.goal.id === goal.id)).toBe(false);
  });
});

describe('goalService — lifecycle', () => {
  it('pauses, resumes, completes, abandons and archives without deleting the goal', async () => {
    const goal = await goalService.createGoal({
      title: 'Correr uma meia maratona',
      area: 'training',
      type: 'numeric',
      priority: 'low',
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'km',
        baseline: 0,
        currentValue: 5,
        targetValue: 21,
      },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
    });

    const paused = await goalService.pauseGoal(goal.id);
    expect(paused?.status).toBe('paused');

    const resumed = await goalService.resumeGoal(goal.id);
    expect(resumed?.status).not.toBe('paused');

    const completed = await goalService.completeGoal(goal.id, {
      whatWorked: 'Treino consistente',
      ratingOutOfFive: 5,
    });
    expect(completed?.status).toBe('completed');
    expect(await goalService.getGoalReflections(goal.id)).toHaveLength(1);

    const reopened = await goalService.reopenGoal(goal.id);
    expect(reopened?.status).not.toBe('completed');

    const abandoned = await goalService.abandonGoal(goal.id, 'notRelevant', 'Mudei de prioridade');
    expect(abandoned?.status).toBe('abandoned');

    const archived = await goalService.archiveGoal(goal.id);
    expect(archived?.status).toBe('archived');

    const stillThere = await goalService.getGoal(goal.id);
    expect(stillThere).not.toBeNull();
  });

  it('duplicates a goal with reset progress and its own fresh history', async () => {
    const original = await goalService.createGoal({
      title: 'Ler 20 livros em 2026',
      area: 'leisure',
      type: 'numeric',
      priority: 'medium',
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'books',
        baseline: 0,
        currentValue: 12,
        targetValue: 20,
      },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
    });
    await goalService.addProgress(original.id, 12, '2026-06-01');

    const duplicate = await goalService.duplicateGoal(original.id);
    expect(duplicate?.id).not.toBe(original.id);
    expect(duplicate?.measurement).toMatchObject({ currentValue: 0 });
    expect(await goalService.getGoalProgress(duplicate!.id)).toHaveLength(0);
    expect(await goalService.getGoalProgress(original.id)).toHaveLength(1);
  });
});
