import { beforeEach, describe, expect, it } from 'vitest';

import type { CompleteWorkoutInput, PerformedSet, SessionExercise } from '../types';
import { routineService } from './routineService';
import { sessionService } from './sessionService';
import { resetTrainingDb, trainingDb } from './trainingMockDb';

function buildCompleteWorkoutInput(
  overrides: Partial<CompleteWorkoutInput> = {},
): CompleteWorkoutInput {
  const sessionExercise: SessionExercise = {
    id: 'se-test-1',
    sessionId: 'session-test-1',
    exerciseId: 'exercise-supino-reto',
    exerciseName: 'Supino reto',
    order: 1,
    sets: [{ setNumber: 1, setType: 'working', targetReps: 8, targetLoadKg: 60, restSeconds: 90 }],
  };
  const performedSets: PerformedSet[] = [
    {
      id: 'ps-test-1',
      sessionId: 'session-test-1',
      sessionExerciseId: 'se-test-1',
      setNumber: 1,
      setType: 'working',
      weightKg: 200,
      reps: 8,
      completed: true,
    },
  ];
  return {
    sessionId: 'session-test-1',
    name: 'Push A',
    startedAt: '2026-08-29T18:00:00.000Z',
    finishedAt: '2026-08-29T19:00:00.000Z',
    sessionExercises: [sessionExercise],
    performedSets,
    ...overrides,
  };
}

describe('sessionService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('completeWorkout persists the session with a computed duration', async () => {
    const { session } = await sessionService.completeWorkout(buildCompleteWorkoutInput());
    expect(session.status).toBe('completed');
    expect(session.durationSeconds).toBe(3600);
  });

  it('completeWorkout detects and persists a new personal record, and lists its id on the session', async () => {
    const { session, newRecords } = await sessionService.completeWorkout(
      buildCompleteWorkoutInput(),
    );
    // 200kg beats the seeded 72.5kg maxWeight PR for Supino reto.
    const maxWeightResult = newRecords.find((record) => record.recordType === 'maxWeight');
    expect(maxWeightResult).toMatchObject({ isNewRecord: true, newValue: 200 });
    expect(session.newPersonalRecordIds).toHaveLength(
      newRecords.filter((r) => r.isNewRecord).length,
    );

    const records = trainingDb.personalRecords.filter(
      (record) => record.exerciseId === 'exercise-supino-reto',
    );
    expect(
      records.some((record) => record.recordType === 'maxWeight' && record.value === 200),
    ).toBe(true);
  });

  it('marks the linked schedule entry as completed when a scheduledEntryId is provided', async () => {
    await sessionService.completeWorkout(
      buildCompleteWorkoutInput({ scheduledEntryId: 'schedule-pull-a-today' }),
    );
    const entry = trainingDb.scheduleEntries.find(
      (candidate) => candidate.id === 'schedule-pull-a-today',
    );
    expect(entry?.status).toBe('completed');
    expect(entry?.sessionId).toBe('session-test-1');
  });

  it('editing the source routine afterward never changes an already-completed session', async () => {
    await sessionService.completeWorkout(
      buildCompleteWorkoutInput({ routineId: 'routine-push-a' }),
    );
    await routineService.updateRoutine('routine-push-a', { name: 'Push A (renomeado)' });

    const session = await sessionService.getWorkoutSession('session-test-1');
    expect(session?.sessionExercises[0]?.exerciseName).toBe('Supino reto');
    expect(session?.name).toBe('Push A');
  });

  it('getWorkoutHistory only returns completed sessions, most recent first', async () => {
    const history = await sessionService.getWorkoutHistory();
    expect(history.every((session) => session.status === 'completed')).toBe(true);
    const dates = history.map((session) => new Date(session.startedAt).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it('getPreviousPerformance returns the most recent completed session for that exercise', async () => {
    const previous = await sessionService.getPreviousPerformance('exercise-supino-reto');
    expect(previous?.session.id).toBe('session-push-a-2');
  });

  it('deleteWorkoutSession cascades to its performed sets', async () => {
    await sessionService.deleteWorkoutSession('session-push-a-1');
    expect(await sessionService.getWorkoutSession('session-push-a-1')).toBeNull();
    const orphanSets = trainingDb.performedSets.filter(
      (set) => set.sessionId === 'session-push-a-1',
    );
    expect(orphanSets).toHaveLength(0);
  });

  it('updatePerformedSet allows correcting a previously logged value', async () => {
    const updated = await sessionService.updatePerformedSet(
      'session-push-a-1-ps-exercise-supino-reto-2',
      {
        weightKg: 71,
      },
    );
    expect(updated?.weightKg).toBe(71);
  });
});
