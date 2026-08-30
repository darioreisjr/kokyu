import type { Exercise, ExerciseDifficulty, ExerciseType, MuscleGroup } from '../types';
import { normalizeSearchText } from './textSearch';

export interface ExerciseFilterOptions {
  search?: string;
  muscleGroup?: MuscleGroup;
  equipmentId?: string;
  exerciseType?: ExerciseType;
  difficulty?: ExerciseDifficulty;
  favoritesOnly?: boolean;
  createdByUserOnly?: boolean;
  includeArchived?: boolean;
}

/** Pure and synchronous — mirrors `features/goals/utils/goalFilters.ts`'s `filterGoals`. */
export function filterExercises(exercises: Exercise[], options: ExerciseFilterOptions): Exercise[] {
  const normalizedQuery = options.search ? normalizeSearchText(options.search) : '';

  return exercises.filter((exercise) => {
    if (!options.includeArchived && exercise.archived) return false;

    if (normalizedQuery) {
      const haystack = [exercise.name, ...(exercise.aliases ?? []), ...(exercise.tags ?? [])]
        .map(normalizeSearchText)
        .join(' ');
      if (!haystack.includes(normalizedQuery)) return false;
    }

    if (options.muscleGroup) {
      const inPrimary = exercise.primaryMuscles.includes(options.muscleGroup);
      const inSecondary = exercise.secondaryMuscles.includes(options.muscleGroup);
      if (!inPrimary && !inSecondary) return false;
    }
    if (options.equipmentId && !exercise.equipmentIds.includes(options.equipmentId)) return false;
    if (options.exerciseType && exercise.exerciseType !== options.exerciseType) return false;
    if (options.difficulty && exercise.difficulty !== options.difficulty) return false;
    if (options.favoritesOnly && !exercise.favorite) return false;
    if (options.createdByUserOnly && !exercise.createdByUser) return false;

    return true;
  });
}

export function sortExercisesByName(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
