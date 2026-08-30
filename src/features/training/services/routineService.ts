import type { MuscleGroup, RoutineExercise, WorkoutRoutine, WorkoutRoutineInput } from '../types';
import { generateId, trainingDb } from './trainingMockDb';

export interface RoutineFilters {
  query?: string;
  muscleGroup?: MuscleGroup;
  equipmentId?: string;
  locationId?: string;
  tag?: string;
  favoritesOnly?: boolean;
  includeArchived?: boolean;
}

/** `WorkoutRoutine.muscleGroups`/`equipmentIds` are derived from its exercises and stored at save time — never recomputed on read (see `docs/training.md`). */
function deriveRoutineMetadata(exercises: RoutineExercise[]): {
  muscleGroups: MuscleGroup[];
  equipmentIds: string[];
} {
  const muscleGroups = new Set<MuscleGroup>();
  const equipmentIds = new Set<string>();
  for (const routineExercise of exercises) {
    const exercise = trainingDb.exercises.find(
      (candidate) => candidate.id === routineExercise.exerciseId,
    );
    if (!exercise) continue;
    exercise.primaryMuscles.forEach((muscle) => muscleGroups.add(muscle));
    exercise.equipmentIds.forEach((equipmentId) => equipmentIds.add(equipmentId));
  }
  return { muscleGroups: [...muscleGroups], equipmentIds: [...equipmentIds] };
}

function matchesFilters(routine: WorkoutRoutine, filters?: RoutineFilters): boolean {
  if (!filters) return !routine.archived;
  if (!filters.includeArchived && routine.archived) return false;
  if (filters.query) {
    const query = filters.query.toLowerCase();
    if (
      !routine.name.toLowerCase().includes(query) &&
      !routine.description?.toLowerCase().includes(query)
    ) {
      return false;
    }
  }
  if (filters.muscleGroup && !routine.muscleGroups.includes(filters.muscleGroup)) return false;
  if (filters.equipmentId && !routine.equipmentIds.includes(filters.equipmentId)) return false;
  if (filters.locationId && routine.locationId !== filters.locationId) return false;
  if (filters.tag && !routine.tags?.includes(filters.tag)) return false;
  if (filters.favoritesOnly && !routine.favorite) return false;
  return true;
}

export const routineService = {
  async getRoutines(filters?: RoutineFilters): Promise<WorkoutRoutine[]> {
    return trainingDb.routines.filter((routine) => matchesFilters(routine, filters));
  },

  async getRoutine(id: string): Promise<WorkoutRoutine | null> {
    return trainingDb.routines.find((routine) => routine.id === id) ?? null;
  },

  async createRoutine(input: WorkoutRoutineInput): Promise<WorkoutRoutine> {
    const now = new Date().toISOString();
    const { muscleGroups, equipmentIds } = deriveRoutineMetadata(input.exercises);
    const routine: WorkoutRoutine = {
      ...input,
      id: generateId('routine'),
      muscleGroups,
      equipmentIds,
      favorite: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    trainingDb.routines.push(routine);
    return routine;
  },

  async updateRoutine(
    id: string,
    patch: Partial<WorkoutRoutineInput>,
  ): Promise<WorkoutRoutine | null> {
    const index = trainingDb.routines.findIndex((routine) => routine.id === id);
    if (index === -1) return null;
    const existing = trainingDb.routines[index]!;
    const merged = { ...existing, ...patch };
    const { muscleGroups, equipmentIds } = deriveRoutineMetadata(merged.exercises);
    const updated: WorkoutRoutine = {
      ...merged,
      muscleGroups,
      equipmentIds,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.routines[index] = updated;
    return updated;
  },

  async duplicateRoutine(id: string): Promise<WorkoutRoutine | null> {
    const original = trainingDb.routines.find((routine) => routine.id === id);
    if (!original) return null;
    const now = new Date().toISOString();
    const duplicate: WorkoutRoutine = {
      ...original,
      id: generateId('routine'),
      name: `${original.name} (cópia)`,
      isTemplate: false,
      favorite: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    trainingDb.routines.push(duplicate);
    return duplicate;
  },

  async archiveRoutine(id: string): Promise<WorkoutRoutine | null> {
    const index = trainingDb.routines.findIndex((routine) => routine.id === id);
    if (index === -1) return null;
    const updated: WorkoutRoutine = {
      ...trainingDb.routines[index]!,
      archived: true,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.routines[index] = updated;
    return updated;
  },

  async toggleFavoriteRoutine(id: string): Promise<WorkoutRoutine | null> {
    const index = trainingDb.routines.findIndex((routine) => routine.id === id);
    if (index === -1) return null;
    const existing = trainingDb.routines[index]!;
    const updated: WorkoutRoutine = {
      ...existing,
      favorite: !existing.favorite,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.routines[index] = updated;
    return updated;
  },
};
