import {
  createMockPerformedSets,
  createMockPersonalRecords,
  createMockPrograms,
  createMockRecoveryCheckIns,
  createMockScheduleEntries,
  createMockSessions,
  mockEquipment,
  mockExercises,
  mockRoutines,
  mockTrainingLocations,
  mockTrainingPreferences,
} from '../mocks';
import type {
  Equipment,
  Exercise,
  PerformedSet,
  PersonalRecord,
  RecoveryCheckIn,
  TrainingLocation,
  TrainingPreferences,
  TrainingProgram,
  TrainingScheduleEntry,
  WorkoutRoutine,
  WorkoutSession,
} from '../types';

/**
 * The in-memory "backend" for Treinamento — mirrors `features/goals/services/goalMockDb.ts` and
 * `features/nutrition/services/nutritionMockDb.ts`: a plain object of arrays, seeded once at
 * module load. Never imported by a component directly — always go through a `*Service` function.
 */
export const trainingDb: {
  exercises: Exercise[];
  equipment: Equipment[];
  locations: TrainingLocation[];
  routines: WorkoutRoutine[];
  programs: TrainingProgram[];
  sessions: WorkoutSession[];
  performedSets: PerformedSet[];
  personalRecords: PersonalRecord[];
  scheduleEntries: TrainingScheduleEntry[];
  recoveryCheckIns: RecoveryCheckIn[];
  preferences: TrainingPreferences;
} = {
  exercises: [...mockExercises],
  equipment: [...mockEquipment],
  locations: [...mockTrainingLocations],
  routines: [...mockRoutines],
  programs: createMockPrograms(),
  sessions: createMockSessions(),
  performedSets: createMockPerformedSets(),
  personalRecords: createMockPersonalRecords(),
  scheduleEntries: createMockScheduleEntries(),
  recoveryCheckIns: createMockRecoveryCheckIns(),
  preferences: { ...mockTrainingPreferences },
};

let idCounter = 1;

export function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

/** Test-only — restores every table to a fresh copy of its starting mock data. Never called from app code. */
export function resetTrainingDb(): void {
  trainingDb.exercises = [...mockExercises];
  trainingDb.equipment = [...mockEquipment];
  trainingDb.locations = [...mockTrainingLocations];
  trainingDb.routines = [...mockRoutines];
  trainingDb.programs = createMockPrograms();
  trainingDb.sessions = createMockSessions();
  trainingDb.performedSets = createMockPerformedSets();
  trainingDb.personalRecords = createMockPersonalRecords();
  trainingDb.scheduleEntries = createMockScheduleEntries();
  trainingDb.recoveryCheckIns = createMockRecoveryCheckIns();
  trainingDb.preferences = { ...mockTrainingPreferences };
}
