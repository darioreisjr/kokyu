import type { ProgramFormValues, ProgramWeekFormValues } from '../schemas/programSchema';
import type { ProgramWeek, TrainingProgram, TrainingProgramInput } from '../types';

function mapWeekToForm(week: ProgramWeek): ProgramWeekFormValues {
  const weekdayRoutineIds: (string | null)[] = Array.from({ length: 7 }, () => null);
  for (const slot of week.scheduledRoutines) {
    weekdayRoutineIds[slot.weekday] = slot.routineId;
  }
  return { id: week.id, order: week.order, isDeload: week.isDeload, weekdayRoutineIds };
}

function mapWeekFromForm(week: ProgramWeekFormValues): ProgramWeek {
  const scheduledRoutines = week.weekdayRoutineIds
    .map((routineId, weekday) => (routineId ? { weekday, routineId } : null))
    .filter((slot): slot is { weekday: number; routineId: string } => slot !== null);
  return { id: week.id, order: week.order, isDeload: week.isDeload, scheduledRoutines };
}

export function mapProgramToFormValues(program: TrainingProgram): ProgramFormValues {
  return {
    name: program.name,
    description: program.description ?? '',
    goal: program.goal,
    experienceLevel: program.experienceLevel,
    durationWeeks: program.durationWeeks,
    daysPerWeek: program.daysPerWeek,
    blocks: program.blocks.map((block) => ({
      id: block.id,
      name: block.name,
      order: block.order,
      type: block.type,
      weeks: block.weeks.map(mapWeekToForm),
    })),
  };
}

export function mapFormValuesToProgramInput(values: ProgramFormValues): TrainingProgramInput {
  return {
    name: values.name,
    description: values.description,
    goal: values.goal,
    experienceLevel: values.experienceLevel,
    durationWeeks: values.durationWeeks,
    daysPerWeek: values.daysPerWeek,
    blocks: values.blocks.map((block) => ({
      id: block.id,
      name: block.name,
      order: block.order,
      type: block.type,
      weeks: block.weeks.map(mapWeekFromForm),
    })),
  };
}
