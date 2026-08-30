import type { LoadType, SetType } from './routine.types';

export type WorkoutSessionStatus = 'planned' | 'inProgress' | 'completed' | 'cancelled';
export type WorkoutLocation = 'gym' | 'home' | 'outdoor' | 'other';

export interface PerformedSet {
  id: string;
  sessionId: string;
  sessionExerciseId: string;
  setNumber: number;
  setType: SetType;
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rpe?: number;
  rir?: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

/** A snapshot of the prescription at the moment the session started — never re-read from the routine, so editing the routine later never rewrites history. */
export interface SessionExercisePrescriptionSnapshot {
  setNumber: number;
  setType: SetType;
  targetReps?: number;
  targetRepsMax?: number;
  targetLoadKg?: number;
  loadType?: LoadType;
  targetDurationSeconds?: number;
  targetDistanceMeters?: number;
  restSeconds: number;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: SessionExercisePrescriptionSnapshot[];
  groupId?: string;
  substitutedForExerciseId?: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  programId?: string;
  programWeekId?: string;
  scheduledEntryId?: string;
  name: string;
  startedAt: string;
  finishedAt?: string;
  durationSeconds?: number;
  sessionExercises: SessionExercise[];
  notes?: string;
  /** Optional post-workout RPE (1–10), never required. */
  perceivedEffort?: number;
  status: WorkoutSessionStatus;
  location?: WorkoutLocation;
  newPersonalRecordIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CompleteWorkoutInput {
  sessionId: string;
  routineId?: string;
  programId?: string;
  programWeekId?: string;
  scheduledEntryId?: string;
  name: string;
  startedAt: string;
  finishedAt: string;
  sessionExercises: SessionExercise[];
  performedSets: PerformedSet[];
  notes?: string;
  perceivedEffort?: number;
  location?: WorkoutLocation;
}
