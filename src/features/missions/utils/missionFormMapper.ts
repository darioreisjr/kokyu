import type { MissionInput } from '../services/missionService';
import type { MissionFormValues } from '../schemas/missionSchema';

/** Converts the flat form schema into the discriminated `MissionInput` shape — mirrors `goals/utils/goalFormMapper.ts`'s role. */
export function missionFormValuesToInput(values: MissionFormValues): MissionInput {
  return {
    title: values.title,
    description: values.description,
    projectId: values.projectId,
    sectionId: values.sectionId,
    areaId: values.areaId,
    priority: values.priority,
    importance: values.importance,
    availableFrom: values.availableFrom,
    plannedDate: values.plannedDate,
    deadline: values.deadline,
    estimatedDuration: values.estimatedDuration,
    preferredDuration: values.preferredDuration,
    splittable: values.splittable,
    minimumChunkDuration: values.minimumChunkDuration,
    energyRequirement: values.energyRequirement,
    contextIds: values.contextIds ?? [],
    tagIds: values.tagIds ?? [],
    goalIds: values.goalIds ?? [],
    waitingFor: values.waitingFor,
    followUpAt: values.followUpAt,
    recurrenceRule: values.recurrenceFrequency
      ? {
          frequency: values.recurrenceFrequency,
          intervalDays: values.recurrenceIntervalDays,
          weekdays: values.recurrenceWeekdays,
          basis: values.recurrenceBasis ?? 'scheduledDate',
        }
      : undefined,
  };
}
