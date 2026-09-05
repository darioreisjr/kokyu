import { z } from 'zod';

/**
 * Quick Capture only ever needs `title` — every other field here is optional so the same schema
 * backs both the one-field quick-add flow and the full progressive-disclosure form (spec
 * "CAMPOS MÍNIMOS"/"NÃO MOSTRAR 20 CAMPOS DE UMA VEZ").
 */
export const missionSchema = z.object({
  title: z.string().min(1, 'O título da missão é obrigatório').max(200, 'Máximo de 200 caracteres'),
  description: z.string().max(2000, 'Máximo de 2000 caracteres').optional(),
  projectId: z.string().optional(),
  sectionId: z.string().optional(),
  areaId: z
    .enum(['work', 'routine', 'training', 'nutrition', 'habits', 'leisure', 'personal', 'other'])
    .optional(),
  priority: z.enum(['none', 'low', 'medium', 'high', 'critical']).optional(),
  importance: z.enum(['low', 'high']).optional(),

  availableFrom: z.string().optional(),
  plannedDate: z.string().optional(),
  deadline: z.string().optional(),

  estimatedDuration: z.number().min(1).optional(),
  preferredDuration: z.number().min(1).optional(),
  splittable: z.boolean().optional(),
  minimumChunkDuration: z.number().min(1).optional(),
  energyRequirement: z.enum(['low', 'medium', 'high']).optional(),

  contextIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  goalIds: z.array(z.string()).optional(),

  waitingFor: z.string().max(300).optional(),
  followUpAt: z.string().optional(),

  recurrenceFrequency: z
    .enum(['daily', 'weekdays', 'weekly', 'monthly', 'yearly', 'specificWeekdays', 'customInterval'])
    .optional(),
  recurrenceIntervalDays: z.number().min(1).optional(),
  recurrenceWeekdays: z.array(z.number().min(0).max(6)).optional(),
  recurrenceBasis: z.enum(['scheduledDate', 'completionDate']).optional(),
});

export type MissionFormValues = z.infer<typeof missionSchema>;

export const missionFormDefaultValues: MissionFormValues = {
  title: '',
  priority: 'none',
  splittable: false,
  contextIds: [],
  tagIds: [],
  goalIds: [],
};

export const quickMissionCaptureSchema = missionSchema.pick({ title: true });
export type QuickMissionCaptureValues = z.infer<typeof quickMissionCaptureSchema>;
