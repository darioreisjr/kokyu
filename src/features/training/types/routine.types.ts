import type { MuscleGroup } from './exercise.types';
import type { ProgressionConfig } from './progression.types';

export type SetType = 'warmup' | 'working' | 'drop' | 'backoff' | 'amrap' | 'failure' | 'timed';

export type LoadType =
  'freeWeight' | 'percent' | 'bodyweight' | 'bodyweightPlusLoad' | 'assisted' | 'manual';

export interface SetPrescription {
  id: string;
  order: number;
  setType: SetType;
  targetReps?: number;
  /** Paired with `targetReps` to express a range, e.g. 8–12. Omit for a fixed rep target. */
  targetRepsMax?: number;
  targetLoadKg?: number;
  loadType?: LoadType;
  targetDurationSeconds?: number;
  targetDistanceMeters?: number;
  restSeconds: number;
  targetRpe?: number;
  targetRir?: number;
  /** Free-form eccentric-pause-concentric-pause notation, e.g. "3-1-1". Never required. */
  tempo?: string;
  notes?: string;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: SetPrescription[];
  progression: ProgressionConfig;
  notes?: string;
  /** Set when this exercise belongs to a superset/circuit — points at `WorkoutRoutine.groups[].id`. */
  groupId?: string;
}

export interface SingleExerciseGroup {
  id: string;
  kind: 'single';
  routineExerciseId: string;
}

export interface SupersetExerciseGroup {
  id: string;
  kind: 'superset';
  routineExerciseIds: string[];
  restBetweenExercisesSeconds: number;
}

/** A circuit is a superset with 3+ exercises repeated for a number of rounds. */
export interface CircuitExerciseGroup {
  id: string;
  kind: 'circuit';
  routineExerciseIds: string[];
  rounds: number;
  restBetweenExercisesSeconds: number;
  restBetweenRoundsSeconds: number;
}

export type ExerciseGroup = SingleExerciseGroup | SupersetExerciseGroup | CircuitExerciseGroup;

export type RoutineGoal =
  'strength' | 'hypertrophy' | 'conditioning' | 'muscularEndurance' | 'general' | 'custom';

export interface RoutineFolder {
  id: string;
  name: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description?: string;
  goal?: RoutineGoal;
  estimatedDurationMinutes?: number;
  exercises: RoutineExercise[];
  groups: ExerciseGroup[];
  tags?: string[];
  /** Derived from the exercises' primary muscles and stored at save time — never recomputed on read. */
  muscleGroups: MuscleGroup[];
  /** Derived from the exercises' equipment and stored at save time, same rule as `muscleGroups`. */
  equipmentIds: string[];
  locationId?: string;
  folderId?: string;
  /** Seeded library routine (Push/Pull/Legs...) vs. the user's own — templates are duplicated, not edited in place. */
  isTemplate?: boolean;
  favorite?: boolean;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WorkoutRoutineInput = Omit<
  WorkoutRoutine,
  'id' | 'muscleGroups' | 'equipmentIds' | 'favorite' | 'archived' | 'createdAt' | 'updatedAt'
>;
