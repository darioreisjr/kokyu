import type { RoutineExerciseFormValues, RoutineFormValues } from '../schemas/routineSchema';
import type {
  ExerciseGroup,
  ProgressionConfig,
  RoutineExercise,
  WorkoutRoutine,
  WorkoutRoutineInput,
} from '../types';

function mapProgressionFromForm(values: RoutineExerciseFormValues): ProgressionConfig {
  switch (values.progressionStrategy) {
    case 'linear':
      return {
        strategy: 'linear',
        incrementKg: values.incrementKg ?? 2.5,
        incrementAfterSuccesses: values.incrementAfterSuccesses ?? 1,
      };
    case 'doubleProgression':
      return {
        strategy: 'doubleProgression',
        repRangeMin: values.repRangeMin ?? 8,
        repRangeMax: values.repRangeMax ?? 12,
        incrementKg: values.incrementKg ?? 2.5,
      };
    case 'percentOfTrainingMax':
      return {
        strategy: 'percentOfTrainingMax',
        trainingMaxKg: values.trainingMaxKg ?? 0,
        percentOfMax: values.percentOfMax ?? 80,
      };
    default:
      return { strategy: 'manual' };
  }
}

type ProgressionFormFields = Pick<
  RoutineExerciseFormValues,
  | 'progressionStrategy'
  | 'incrementKg'
  | 'incrementAfterSuccesses'
  | 'repRangeMin'
  | 'repRangeMax'
  | 'trainingMaxKg'
  | 'percentOfMax'
>;

function mapProgressionToForm(progression: ProgressionConfig): ProgressionFormFields {
  switch (progression.strategy) {
    case 'linear':
      return {
        progressionStrategy: 'linear',
        incrementKg: progression.incrementKg,
        incrementAfterSuccesses: progression.incrementAfterSuccesses,
      };
    case 'doubleProgression':
      return {
        progressionStrategy: 'doubleProgression',
        repRangeMin: progression.repRangeMin,
        repRangeMax: progression.repRangeMax,
        incrementKg: progression.incrementKg,
      };
    case 'percentOfTrainingMax':
      return {
        progressionStrategy: 'percentOfTrainingMax',
        trainingMaxKg: progression.trainingMaxKg,
        percentOfMax: progression.percentOfMax,
      };
    default:
      return { progressionStrategy: 'manual' };
  }
}

/**
 * Groups are derived from each exercise's `groupId` rather than edited directly — 2+ exercises
 * sharing one `groupId` become a superset, everything else is `single`. The Builder doesn't offer
 * circuit creation directly (only supersets); a circuit still round-trips correctly if one already
 * exists in the data, it just isn't authorable from this form yet.
 */
function deriveGroups(exercises: RoutineExercise[]): ExerciseGroup[] {
  const byGroupId = new Map<string, RoutineExercise[]>();
  const groups: ExerciseGroup[] = [];

  for (const exercise of exercises) {
    if (!exercise.groupId) {
      groups.push({ id: `group-${exercise.id}`, kind: 'single', routineExerciseId: exercise.id });
      continue;
    }
    const members = byGroupId.get(exercise.groupId) ?? [];
    members.push(exercise);
    byGroupId.set(exercise.groupId, members);
  }

  for (const [groupId, members] of byGroupId) {
    if (members.length < 2) {
      groups.push({ id: groupId, kind: 'single', routineExerciseId: members[0]!.id });
      continue;
    }
    const restBetweenExercisesSeconds = Math.min(
      ...members.map((member) => member.sets[0]?.restSeconds ?? 15),
    );
    groups.push({
      id: groupId,
      kind: 'superset',
      routineExerciseIds: members.map((member) => member.id),
      restBetweenExercisesSeconds,
    });
  }

  return groups;
}

export function mapFormValuesToRoutineInput(values: RoutineFormValues): WorkoutRoutineInput {
  const exercises: RoutineExercise[] = values.exercises.map((exerciseValues) => ({
    id: exerciseValues.id,
    exerciseId: exerciseValues.exerciseId,
    order: exerciseValues.order,
    groupId: exerciseValues.groupId,
    notes: exerciseValues.notes,
    progression: mapProgressionFromForm(exerciseValues),
    sets: exerciseValues.sets.map((set) => ({ ...set })),
  }));

  return {
    name: values.name,
    description: values.description,
    goal: values.goal,
    estimatedDurationMinutes: values.estimatedDurationMinutes,
    locationId: values.locationId,
    exercises,
    groups: deriveGroups(exercises),
  };
}

export function mapRoutineToFormValues(routine: WorkoutRoutine): RoutineFormValues {
  return {
    name: routine.name,
    description: routine.description ?? '',
    goal: routine.goal,
    estimatedDurationMinutes: routine.estimatedDurationMinutes,
    locationId: routine.locationId,
    exercises: routine.exercises.map((exercise) => ({
      id: exercise.id,
      exerciseId: exercise.exerciseId,
      order: exercise.order,
      groupId: exercise.groupId,
      notes: exercise.notes,
      sets: exercise.sets,
      ...mapProgressionToForm(exercise.progression),
    })),
  };
}
