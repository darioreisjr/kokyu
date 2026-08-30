import type {
  Exercise,
  MuscleGroup,
  MuscleVolumeEntry,
  PerformedSet,
  SessionExercise,
  WorkoutSession,
} from '../types';

/**
 * A working (non-warmup, completed) set counts as a "direct set" for every one of its exercise's
 * `primaryMuscles` — secondary muscles are intentionally excluded from this base metric so a
 * single set doesn't get double-counted across many muscle groups. Documented decision, see
 * `docs/training.md`.
 */
export function calculateSessionMuscleVolume(
  sessionExercises: SessionExercise[],
  performedSets: PerformedSet[],
  exercises: Exercise[],
): MuscleVolumeEntry[] {
  const totals = new Map<MuscleGroup, { directSets: number; totalVolumeKg: number }>();

  for (const sessionExercise of sessionExercises) {
    const exercise = exercises.find((candidate) => candidate.id === sessionExercise.exerciseId);
    if (!exercise) continue;

    const sets = performedSets.filter(
      (set) =>
        set.sessionExerciseId === sessionExercise.id && set.completed && set.setType !== 'warmup',
    );
    if (sets.length === 0) continue;

    const setVolume = sets.reduce((total, set) => total + (set.weightKg ?? 0) * (set.reps ?? 0), 0);

    for (const muscle of exercise.primaryMuscles) {
      const current = totals.get(muscle) ?? { directSets: 0, totalVolumeKg: 0 };
      totals.set(muscle, {
        directSets: current.directSets + sets.length,
        totalVolumeKg: current.totalVolumeKg + setVolume,
      });
    }
  }

  return [...totals.entries()]
    .map(([muscleGroup, value]) => ({ muscleGroup, ...value }))
    .sort((a, b) => b.directSets - a.directSets);
}

/** Same rule applied across many sessions — used for the weekly muscle-volume heatmap. */
export function calculateMuscleVolumeAcrossSessions(
  sessions: WorkoutSession[],
  performedSets: PerformedSet[],
  exercises: Exercise[],
): MuscleVolumeEntry[] {
  const totals = new Map<MuscleGroup, { directSets: number; totalVolumeKg: number }>();

  for (const session of sessions) {
    const setsForSession = performedSets.filter((set) => set.sessionId === session.id);
    const entries = calculateSessionMuscleVolume(
      session.sessionExercises,
      setsForSession,
      exercises,
    );
    for (const entry of entries) {
      const current = totals.get(entry.muscleGroup) ?? { directSets: 0, totalVolumeKg: 0 };
      totals.set(entry.muscleGroup, {
        directSets: current.directSets + entry.directSets,
        totalVolumeKg: current.totalVolumeKg + entry.totalVolumeKg,
      });
    }
  }

  return [...totals.entries()]
    .map(([muscleGroup, value]) => ({ muscleGroup, ...value }))
    .sort((a, b) => b.directSets - a.directSets);
}
