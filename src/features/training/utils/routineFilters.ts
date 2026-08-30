import type { MuscleGroup, WorkoutRoutine } from '../types';
import { normalizeSearchText } from './textSearch';

export interface RoutineFilterOptions {
  search?: string;
  muscleGroup?: MuscleGroup;
  equipmentId?: string;
  locationId?: string;
  tag?: string;
  favoritesOnly?: boolean;
  includeArchived?: boolean;
}

export function filterRoutines(
  routines: WorkoutRoutine[],
  options: RoutineFilterOptions,
): WorkoutRoutine[] {
  const normalizedQuery = options.search ? normalizeSearchText(options.search) : '';

  return routines.filter((routine) => {
    if (!options.includeArchived && routine.archived) return false;

    if (normalizedQuery) {
      const haystack = [routine.name, routine.description ?? '', ...(routine.tags ?? [])]
        .map(normalizeSearchText)
        .join(' ');
      if (!haystack.includes(normalizedQuery)) return false;
    }

    if (options.muscleGroup && !routine.muscleGroups.includes(options.muscleGroup)) return false;
    if (options.equipmentId && !routine.equipmentIds.includes(options.equipmentId)) return false;
    if (options.locationId && routine.locationId !== options.locationId) return false;
    if (options.tag && !routine.tags?.includes(options.tag)) return false;
    if (options.favoritesOnly && !routine.favorite) return false;

    return true;
  });
}
