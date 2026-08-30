import { subDays } from 'date-fns';

import type { SessionExercise, WorkoutLocation, WorkoutRoutine, WorkoutSession } from '../types';
import { getMockExercise } from './exercises.mock';
import { mockRoutineLegsA, mockRoutinePullA, mockRoutinePushA } from './routines.mock';

export interface MockSessionPlan {
  sessionId: string;
  routine: WorkoutRoutine;
  daysAgo: number;
  durationMinutes: number;
  location: WorkoutLocation;
}

/**
 * A small, believable spread of recently-completed sessions anchored to "today" (via `daysAgo`)
 * rather than a fixed calendar week — otherwise the demo data would read as stale the day after
 * it was written (same rationale as `features/nutrition/mocks/mealPlan.mock.ts`). Exported so
 * `performedSets.mock.ts`, `personalRecords.mock.ts` and `scheduleEntries.mock.ts` can stay
 * cross-referenced with the exact same session ids and timing instead of re-guessing them.
 */
export const mockSessionPlans: MockSessionPlan[] = [
  {
    sessionId: 'session-push-a-1',
    routine: mockRoutinePushA,
    daysAgo: 9,
    durationMinutes: 58,
    location: 'gym',
  },
  {
    sessionId: 'session-pull-a-1',
    routine: mockRoutinePullA,
    daysAgo: 6,
    durationMinutes: 62,
    location: 'gym',
  },
  {
    sessionId: 'session-legs-a-1',
    routine: mockRoutineLegsA,
    daysAgo: 4,
    durationMinutes: 65,
    location: 'gym',
  },
  {
    sessionId: 'session-push-a-2',
    routine: mockRoutinePushA,
    daysAgo: 2,
    durationMinutes: 55,
    location: 'gym',
  },
];

export function getSessionTiming(
  plan: MockSessionPlan,
  referenceDate: Date,
): { startedAt: Date; finishedAt: Date } {
  const startedAt = subDays(referenceDate, plan.daysAgo);
  const finishedAt = new Date(startedAt.getTime() + plan.durationMinutes * 60_000);
  return { startedAt, finishedAt };
}

export function createSessionExerciseSnapshots(
  sessionId: string,
  routine: WorkoutRoutine,
): SessionExercise[] {
  return routine.exercises.map((routineExercise, index) => ({
    id: `${sessionId}-se-${routineExercise.exerciseId}`,
    sessionId,
    exerciseId: routineExercise.exerciseId,
    exerciseName: getMockExercise(routineExercise.exerciseId)?.name ?? routineExercise.exerciseId,
    order: index + 1,
    groupId: routineExercise.groupId,
    sets: routineExercise.sets.map((set) => ({
      setNumber: set.order,
      setType: set.setType,
      targetReps: set.targetReps,
      targetRepsMax: set.targetRepsMax,
      targetLoadKg: set.targetLoadKg,
      loadType: set.loadType,
      targetDurationSeconds: set.targetDurationSeconds,
      targetDistanceMeters: set.targetDistanceMeters,
      restSeconds: set.restSeconds,
    })),
  }));
}

export function createMockSessions(referenceDate: Date = new Date()): WorkoutSession[] {
  return mockSessionPlans.map((plan) => {
    const { startedAt, finishedAt } = getSessionTiming(plan, referenceDate);
    return {
      id: plan.sessionId,
      routineId: plan.routine.id,
      name: plan.routine.name,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationSeconds: plan.durationMinutes * 60,
      sessionExercises: createSessionExerciseSnapshots(plan.sessionId, plan.routine),
      status: 'completed',
      location: plan.location,
      perceivedEffort: 7,
      createdAt: startedAt.toISOString(),
      updatedAt: finishedAt.toISOString(),
    };
  });
}
