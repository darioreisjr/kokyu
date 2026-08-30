import type {
  Exercise,
  ExerciseDifficulty,
  ExerciseInput,
  ExercisePreference,
  ExerciseType,
  MuscleGroup,
} from '../types';
import { generateId, trainingDb } from './trainingMockDb';

export interface ExerciseFilters {
  query?: string;
  muscleGroup?: MuscleGroup;
  equipmentId?: string;
  exerciseType?: ExerciseType;
  difficulty?: ExerciseDifficulty;
  favoritesOnly?: boolean;
  createdByUserOnly?: boolean;
  includeArchived?: boolean;
}

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

function matchesFilters(exercise: Exercise, filters?: ExerciseFilters): boolean {
  if (!filters) return !exercise.archived;
  if (!filters.includeArchived && exercise.archived) return false;
  if (filters.query) {
    const query = filters.query.toLowerCase();
    const haystack = [exercise.name, ...(exercise.aliases ?? []), ...(exercise.tags ?? [])]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.muscleGroup) {
    const inPrimary = exercise.primaryMuscles.includes(filters.muscleGroup);
    const inSecondary = exercise.secondaryMuscles.includes(filters.muscleGroup);
    if (!inPrimary && !inSecondary) return false;
  }
  if (filters.equipmentId && !exercise.equipmentIds.includes(filters.equipmentId)) return false;
  if (filters.exerciseType && exercise.exerciseType !== filters.exerciseType) return false;
  if (filters.difficulty && exercise.difficulty !== filters.difficulty) return false;
  if (filters.favoritesOnly && !exercise.favorite) return false;
  if (filters.createdByUserOnly && !exercise.createdByUser) return false;
  return true;
}

/**
 * `updateExercise`/`archiveExercise` only succeed for `createdByUser: true` exercises — library
 * exercises are read-only for their identity fields so an edit can never silently break a routine
 * that references them. `toggleFavoriteExercise`/`updateExercisePreference`/
 * `updateExercisePersonalNotes` are separate, always-allowed mutations that work on any exercise.
 */
export const exerciseService = {
  async getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    return trainingDb.exercises.filter((exercise) => matchesFilters(exercise, filters));
  },

  async getExercise(id: string): Promise<Exercise | null> {
    return trainingDb.exercises.find((exercise) => exercise.id === id) ?? null;
  },

  async searchExercises(query: string): Promise<Exercise[]> {
    return exerciseService.getExercises({ query });
  },

  async createCustomExercise(input: ExerciseInput): Promise<Exercise> {
    const now = new Date().toISOString();
    const exercise: Exercise = {
      ...input,
      id: generateId('exercise'),
      slug: slugify(input.name),
      createdByUser: true,
      favorite: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    trainingDb.exercises.push(exercise);
    return exercise;
  },

  async updateExercise(id: string, patch: Partial<ExerciseInput>): Promise<Exercise | null> {
    const index = trainingDb.exercises.findIndex((exercise) => exercise.id === id);
    if (index === -1) return null;
    const existing = trainingDb.exercises[index]!;
    if (!existing.createdByUser) return null;
    const updated: Exercise = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    trainingDb.exercises[index] = updated;
    return updated;
  },

  async archiveExercise(id: string): Promise<Exercise | null> {
    const index = trainingDb.exercises.findIndex((exercise) => exercise.id === id);
    if (index === -1) return null;
    const existing = trainingDb.exercises[index]!;
    if (!existing.createdByUser) return null;
    const updated: Exercise = { ...existing, archived: true, updatedAt: new Date().toISOString() };
    trainingDb.exercises[index] = updated;
    return updated;
  },

  async toggleFavoriteExercise(id: string): Promise<Exercise | null> {
    const index = trainingDb.exercises.findIndex((exercise) => exercise.id === id);
    if (index === -1) return null;
    const existing = trainingDb.exercises[index]!;
    const updated: Exercise = {
      ...existing,
      favorite: !existing.favorite,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.exercises[index] = updated;
    return updated;
  },

  async updateExercisePreference(
    id: string,
    preference: ExercisePreference,
  ): Promise<Exercise | null> {
    const index = trainingDb.exercises.findIndex((exercise) => exercise.id === id);
    if (index === -1) return null;
    const updated: Exercise = {
      ...trainingDb.exercises[index]!,
      exercisePreference: preference,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.exercises[index] = updated;
    return updated;
  },

  async updateExercisePersonalNotes(id: string, personalNotes: string): Promise<Exercise | null> {
    const index = trainingDb.exercises.findIndex((exercise) => exercise.id === id);
    if (index === -1) return null;
    const updated: Exercise = {
      ...trainingDb.exercises[index]!,
      personalNotes,
      updatedAt: new Date().toISOString(),
    };
    trainingDb.exercises[index] = updated;
    return updated;
  },
};
