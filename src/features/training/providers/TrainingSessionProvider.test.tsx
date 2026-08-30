import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { activeWorkoutSessionStorage } from '../services/activeWorkoutSessionStorage';
import { resetTrainingDb, trainingDb } from '../services/trainingMockDb';
import type { Exercise, PersonalRecordCheckResult, WorkoutRoutine, WorkoutSession } from '../types';
import { TrainingSessionProvider, useTrainingSession } from './TrainingSessionProvider';

const exercise: Exercise = {
  id: 'exercise-supino-reto',
  name: 'Supino reto',
  slug: 'supino-reto',
  exerciseType: 'strength',
  primaryMuscles: ['chest'],
  secondaryMuscles: [],
  equipmentIds: [],
  trackingType: 'weightReps',
  createdByUser: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const routine: WorkoutRoutine = {
  id: 'routine-push-a',
  name: 'Push A',
  exercises: [
    {
      id: 're-1',
      exerciseId: exercise.id,
      order: 1,
      progression: { strategy: 'manual' },
      sets: [
        {
          id: 'set-1',
          order: 1,
          setType: 'working',
          targetReps: 8,
          targetLoadKg: 60,
          restSeconds: 90,
        },
      ],
    },
  ],
  groups: [{ id: 'group-1', kind: 'single', routineExerciseId: 're-1' }],
  muscleGroups: ['chest'],
  equipmentIds: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

function renderProvider() {
  return renderHook(() => useTrainingSession(), {
    wrapper: ({ children }) => <TrainingSessionProvider>{children}</TrainingSessionProvider>,
  });
}

describe('TrainingSessionProvider', () => {
  beforeEach(() => {
    resetTrainingDb();
    activeWorkoutSessionStorage.clear();
  });

  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useTrainingSession())).toThrow(/TrainingSessionProvider/);
  });

  it('starts with no active session once hydrated', async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.activeSession).toBeNull();
  });

  it('startSession snapshots the routine into sessionExercises', async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => result.current.startSession(routine, [exercise]));

    expect(result.current.activeSession?.name).toBe('Push A');
    expect(result.current.activeSession?.sessionExercises).toHaveLength(1);
    expect(result.current.activeSession?.sessionExercises[0]?.exerciseName).toBe('Supino reto');
  });

  it('persists the active session to localStorage and recovers it on remount', async () => {
    const { result, unmount } = renderProvider();
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    act(() => result.current.startSession(routine, [exercise]));
    const sessionId = result.current.activeSession!.sessionId;

    await waitFor(() => expect(activeWorkoutSessionStorage.load()?.sessionId).toBe(sessionId));
    unmount();

    const { result: recovered } = renderProvider();
    await waitFor(() => expect(recovered.current.isHydrated).toBe(true));
    expect(recovered.current.activeSession?.sessionId).toBe(sessionId);
  });

  it('logSet upserts by (sessionExerciseId, setNumber) instead of duplicating', async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    act(() => result.current.startSession(routine, [exercise]));
    const sessionExerciseId = result.current.activeSession!.sessionExercises[0]!.id;

    act(() =>
      result.current.logSet(sessionExerciseId, {
        setNumber: 1,
        setType: 'working',
        weightKg: 60,
        reps: 8,
        completed: true,
      }),
    );
    expect(result.current.activeSession?.performedSets).toHaveLength(1);

    act(() =>
      result.current.logSet(sessionExerciseId, {
        setNumber: 1,
        setType: 'working',
        weightKg: 62.5,
        reps: 8,
        completed: true,
      }),
    );
    expect(result.current.activeSession?.performedSets).toHaveLength(1);
    expect(result.current.activeSession?.performedSets[0]?.weightKg).toBe(62.5);
  });

  it('logSet preserves the real setType instead of defaulting a warmup set to working', async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    act(() => result.current.startSession(routine, [exercise]));
    const sessionExerciseId = result.current.activeSession!.sessionExercises[0]!.id;

    act(() =>
      result.current.logSet(sessionExerciseId, {
        setNumber: 1,
        setType: 'warmup',
        weightKg: 40,
        reps: 10,
        completed: true,
      }),
    );

    expect(result.current.activeSession?.performedSets[0]?.setType).toBe('warmup');
  });

  it('addSetToExercise appends a new prescription set copying the previous set defaults', async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    act(() => result.current.startSession(routine, [exercise]));
    const sessionExerciseId = result.current.activeSession!.sessionExercises[0]!.id;

    act(() => result.current.addSetToExercise(sessionExerciseId));

    const sets = result.current.activeSession?.sessionExercises[0]?.sets;
    expect(sets).toHaveLength(2);
    expect(sets?.[1]).toMatchObject({
      setNumber: 2,
      setType: 'working',
      targetReps: 8,
      targetLoadKg: 60,
    });
  });

  it('startRest/skipRest set and clear restEndAt', async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    act(() => result.current.startSession(routine, [exercise]));

    act(() => result.current.startRest(90));
    expect(result.current.activeSession?.restEndAt).toBeDefined();

    act(() => result.current.skipRest());
    expect(result.current.activeSession?.restEndAt).toBeUndefined();
  });

  it('finishWorkout commits the session via sessionService and clears the active session', async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    act(() => result.current.startSession(routine, [exercise]));
    const sessionExerciseId = result.current.activeSession!.sessionExercises[0]!.id;
    act(() =>
      result.current.logSet(sessionExerciseId, {
        setNumber: 1,
        setType: 'working',
        weightKg: 60,
        reps: 8,
        completed: true,
      }),
    );

    const captured: {
      result: { session: WorkoutSession; newRecords: PersonalRecordCheckResult[] } | null;
    } = {
      result: null,
    };
    await act(async () => {
      captured.result = await result.current.finishWorkout();
    });

    expect(captured.result?.session.status).toBe('completed');
    expect(trainingDb.sessions.some((session) => session.id === captured.result?.session.id)).toBe(
      true,
    );
    expect(result.current.activeSession).toBeNull();
    expect(activeWorkoutSessionStorage.load()).toBeNull();
  });

  it('discardSession clears state without writing anything to trainingDb', async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    const sessionsBefore = trainingDb.sessions.length;
    act(() => result.current.startSession(routine, [exercise]));

    act(() => result.current.discardSession());

    expect(result.current.activeSession).toBeNull();
    expect(trainingDb.sessions).toHaveLength(sessionsBefore);
    expect(activeWorkoutSessionStorage.load()).toBeNull();
  });
});
