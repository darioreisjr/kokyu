import { describe, expect, it } from 'vitest';

import type { Exercise, PerformedSet, SessionExercise, WorkoutSession } from '../types';
import {
  calculateMuscleVolumeAcrossSessions,
  calculateSessionMuscleVolume,
} from './muscleVolumeCalculator';

const chestExercise: Exercise = {
  id: 'exercise-1',
  name: 'Supino reto',
  slug: 'supino-reto',
  exerciseType: 'strength',
  primaryMuscles: ['chest'],
  secondaryMuscles: ['triceps'],
  equipmentIds: [],
  trackingType: 'weightReps',
  createdByUser: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const sessionExercise: SessionExercise = {
  id: 'se-1',
  sessionId: 'session-1',
  exerciseId: 'exercise-1',
  exerciseName: 'Supino reto',
  order: 1,
  sets: [],
};

function performedSet(overrides: Partial<PerformedSet>): PerformedSet {
  return {
    id: 'ps-1',
    sessionId: 'session-1',
    sessionExerciseId: 'se-1',
    setNumber: 1,
    setType: 'working',
    completed: true,
    ...overrides,
  };
}

describe('calculateSessionMuscleVolume', () => {
  it('counts working sets toward the exercise primary muscle only', () => {
    const sets = [
      performedSet({ id: 'ps-1', weightKg: 100, reps: 10 }),
      performedSet({ id: 'ps-2', weightKg: 100, reps: 10 }),
    ];
    const result = calculateSessionMuscleVolume([sessionExercise], sets, [chestExercise]);
    expect(result).toEqual([{ muscleGroup: 'chest', directSets: 2, totalVolumeKg: 2000 }]);
  });

  it('excludes warmup sets from direct-set and volume totals', () => {
    const sets = [
      performedSet({ id: 'ps-1', weightKg: 40, reps: 10, setType: 'warmup' }),
      performedSet({ id: 'ps-2', weightKg: 100, reps: 8 }),
    ];
    const result = calculateSessionMuscleVolume([sessionExercise], sets, [chestExercise]);
    expect(result).toEqual([{ muscleGroup: 'chest', directSets: 1, totalVolumeKg: 800 }]);
  });

  it('returns an empty array when the exercise is not found in the catalog', () => {
    const result = calculateSessionMuscleVolume([sessionExercise], [performedSet({})], []);
    expect(result).toEqual([]);
  });
});

describe('calculateMuscleVolumeAcrossSessions', () => {
  it('aggregates direct sets and volume across multiple sessions', () => {
    const sessionA: WorkoutSession = {
      id: 'session-1',
      name: 'Push A',
      startedAt: '2026-01-01T10:00:00.000Z',
      status: 'completed',
      sessionExercises: [sessionExercise],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };
    const sessionExerciseB: SessionExercise = {
      ...sessionExercise,
      id: 'se-2',
      sessionId: 'session-2',
    };
    const sessionB: WorkoutSession = {
      ...sessionA,
      id: 'session-2',
      sessionExercises: [sessionExerciseB],
    };
    const sets = [
      performedSet({
        id: 'ps-1',
        weightKg: 100,
        reps: 10,
        sessionId: 'session-1',
        sessionExerciseId: 'se-1',
      }),
      performedSet({
        id: 'ps-2',
        weightKg: 100,
        reps: 10,
        sessionId: 'session-2',
        sessionExerciseId: 'se-2',
      }),
    ];
    const result = calculateMuscleVolumeAcrossSessions([sessionA, sessionB], sets, [chestExercise]);
    expect(result).toEqual([{ muscleGroup: 'chest', directSets: 2, totalVolumeKg: 2000 }]);
  });
});
