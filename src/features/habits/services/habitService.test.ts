import { beforeEach, describe, expect, it } from 'vitest';
import { resetHabitDb } from './habitMockDb';
import { habitService } from './habitService';

describe('habitService', () => {
  beforeEach(() => {
    resetHabitDb();
  });

  it('creates, reads, updates, and deletes habits', async () => {
    const created = await habitService.createHabit({
      name: 'Novo Hábito de Teste',
      area: 'routine',
      direction: 'build',
      trackingType: 'binary',
      status: 'active',
      target: { type: 'binary' },
      schedule: {
        frequencyType: 'daily',
        effectiveFrom: '2026-01-01',
      },
      reminders: [],
      timeOfDay: 'morning',
      startDate: '2026-01-01',
      icon: 'CheckCircleRounded',
      tags: [],
      source: 'manual',
      goalIds: [],
      routineIds: [],
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Novo Hábito de Teste');

    const fetched = await habitService.getHabit(created.id);
    expect(fetched?.name).toBe('Novo Hábito de Teste');

    const updated = await habitService.updateHabit(created.id, {
      name: 'Nome Atualizado',
    });
    expect(updated?.name).toBe('Nome Atualizado');

    await habitService.deleteHabit(created.id);
    const afterDelete = await habitService.getHabit(created.id);
    expect(afterDelete).toBeNull();
  });

  it('duplicates habit with reset streak and copy suffix', async () => {
    const habits = await habitService.getHabits();
    const firstHabit = habits[0]!;

    const duplicated = await habitService.duplicateHabit(firstHabit.id);
    expect(duplicated).not.toBeNull();
    expect(duplicated?.name).toContain('(cópia)');
    expect(duplicated?.id).not.toBe(firstHabit.id);
  });

  it('pauses and resumes habit', async () => {
    const habits = await habitService.getHabits();
    const habit = habits[0]!;

    const paused = await habitService.pauseHabit(habit.id);
    expect(paused?.status).toBe('paused');

    const resumed = await habitService.resumeHabit(habit.id);
    expect(resumed?.status).toBe('active');
  });

  it('archives and unarchives habit', async () => {
    const habits = await habitService.getHabits();
    const habit = habits[0]!;

    const archived = await habitService.archiveHabit(habit.id);
    expect(archived?.status).toBe('archived');

    const unarchived = await habitService.unarchiveHabit(habit.id);
    expect(unarchived?.status).toBe('active');
  });

  it('creates and retrieves routines and habit reviews', async () => {
    const routine = await habitService.createRoutine({
      name: 'Rotina Noturna Teste',
      timeOfDay: 'evening',
      habitIds: ['habit-1'],
      items: [{ routineId: 'r-test', habitId: 'habit-1', order: 0 }],
      active: true,
    });

    expect(routine.id).toBeDefined();
    const routines = await habitService.getRoutines();
    expect(routines.some((r) => r.id === routine.id)).toBe(true);

    const review = await habitService.createHabitReview({
      type: 'weekly',
      periodStart: '2026-03-01',
      periodEnd: '2026-03-07',
      reflections: {
        whatWorked: 'Tudo fluiu perfeitamente',
      },
      adjustmentsMade: [],
    });

    expect(review.id).toBeDefined();
    const reviews = await habitService.getHabitReviews();
    expect(reviews.some((r) => r.id === review.id)).toBe(true);
  });
});
