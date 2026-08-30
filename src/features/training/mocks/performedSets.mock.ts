import type { PerformedSet } from '../types';
import {
  createSessionExerciseSnapshots,
  getSessionTiming,
  mockSessionPlans,
} from './sessions.mock';

interface PerformedOverride {
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  rpe?: number;
}

/**
 * `${sessionId}:${exerciseId}` → one override per set order. Only used where the generic
 * "hit the prescribed target" default below isn't enough — AMRAP sets have no numeric target at
 * all, and Push A's Supino reto is deliberately progressed across `session-push-a-1` →
 * `session-push-a-2` so the PR engine and progress trend have something real to show.
 */
const performedOverrides: Record<string, PerformedOverride[]> = {
  'session-push-a-1:exercise-supino-reto': [
    { weightKg: 40, reps: 10 },
    { weightKg: 70, reps: 6, rpe: 8 },
    { weightKg: 70, reps: 6, rpe: 8 },
    { weightKg: 70, reps: 6, rpe: 9 },
  ],
  'session-push-a-2:exercise-supino-reto': [
    { weightKg: 40, reps: 10 },
    { weightKg: 72.5, reps: 7, rpe: 8 },
    { weightKg: 72.5, reps: 7, rpe: 8 },
    { weightKg: 72.5, reps: 6, rpe: 9 },
  ],
  'session-pull-a-1:exercise-barra-fixa': [{ reps: 9 }, { reps: 7 }, { reps: 6 }],
};

/** Generates believable "hit the target" performed sets from a session's own prescription snapshot. */
export function createMockPerformedSets(referenceDate: Date = new Date()): PerformedSet[] {
  const performedSets: PerformedSet[] = [];

  for (const plan of mockSessionPlans) {
    const { startedAt } = getSessionTiming(plan, referenceDate);
    const sessionExercises = createSessionExerciseSnapshots(plan.sessionId, plan.routine);
    let elapsedSeconds = 0;

    for (const sessionExercise of sessionExercises) {
      const overrideKey = `${plan.sessionId}:${sessionExercise.exerciseId}`;
      const overrides = performedOverrides[overrideKey];

      sessionExercise.sets.forEach((set, setIndex) => {
        elapsedSeconds += 45 + set.restSeconds;
        const override = overrides?.[setIndex];
        const completedAt = new Date(startedAt.getTime() + elapsedSeconds * 1000).toISOString();

        performedSets.push({
          id: `${plan.sessionId}-ps-${sessionExercise.exerciseId}-${set.setNumber}`,
          sessionId: plan.sessionId,
          sessionExerciseId: sessionExercise.id,
          setNumber: set.setNumber,
          setType: set.setType,
          weightKg: override?.weightKg ?? set.targetLoadKg,
          reps: override?.reps ?? set.targetRepsMax ?? set.targetReps,
          durationSeconds: override?.durationSeconds ?? set.targetDurationSeconds,
          rpe: override?.rpe,
          completed: true,
          completedAt,
        });
      });
    }
  }

  return performedSets;
}
