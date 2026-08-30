export type ExerciseType =
  'strength' | 'bodyweight' | 'cardio' | 'mobility' | 'stretch' | 'timed' | 'custom';

/** Which fields a `SetPrescription`/`PerformedSet` should actually show for this exercise — never render all of them. */
export type TrackingType =
  'weightReps' | 'reps' | 'time' | 'distanceTime' | 'weightTime' | 'distance' | 'custom';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'lowerBack'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'adductors'
  | 'abductors'
  | 'traps';

export type MovementPattern =
  'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'rotation' | 'isolation';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** Drives filtering/Workout Builder suggestions later — never used to auto-generate a workout today. */
export type ExercisePreference = 'preferred' | 'neutral' | 'lessPreferred' | 'excluded';

export interface ExerciseMedia {
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  description?: string;
  instructions?: string;
  exerciseType: ExerciseType;
  movementPattern?: MovementPattern;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  /** Empty array = no equipment needed (bodyweight). */
  equipmentIds: string[];
  difficulty?: ExerciseDifficulty;
  /** Logged per side during a session instead of one shared set. */
  unilateral?: boolean;
  trackingType: TrackingType;
  media?: ExerciseMedia;
  aliases?: string[];
  tags?: string[];
  defaultRestSeconds?: number;
  /** Only exercises the user created can be edited or deleted — protects routines that reference the shared library. */
  createdByUser: boolean;
  favorite?: boolean;
  /** Freeform note only the user sees, e.g. "banco posição 3" — distinct from `instructions`, which is catalog copy. */
  personalNotes?: string;
  exercisePreference?: ExercisePreference;
  /** Related, not equivalent — e.g. supino barra → supino halteres. Never swapped automatically. */
  substituteExerciseIds?: string[];
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExerciseInput = Omit<
  Exercise,
  'id' | 'slug' | 'createdByUser' | 'favorite' | 'archived' | 'createdAt' | 'updatedAt'
>;
