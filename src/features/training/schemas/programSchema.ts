import { z } from 'zod';

const programWeekFormSchema = z.object({
  id: z.string(),
  order: z.number(),
  isDeload: z.boolean(),
  /** Index = weekday (0 Sunday .. 6 Saturday); `null` = no routine scheduled that day. Mapped to/from `ScheduledRoutineSlot[]` by `utils/programFormMapper.ts`. */
  weekdayRoutineIds: z.array(z.string().nullable()).length(7),
});

const trainingBlockFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Informe um nome para o bloco'),
  order: z.number(),
  type: z.enum(['base', 'accumulation', 'intensification', 'peak', 'deload', 'custom']),
  weeks: z.array(programWeekFormSchema).min(1, 'Adicione ao menos uma semana'),
});

export const programFormSchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  description: z.string().optional(),
  goal: z
    .enum(['strength', 'hypertrophy', 'conditioning', 'muscularEndurance', 'general', 'custom'])
    .optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  durationWeeks: z.number().min(1, 'Informe a duração em semanas'),
  daysPerWeek: z.number().min(1).max(7).optional(),
  blocks: z.array(trainingBlockFormSchema).min(1, 'Adicione ao menos um bloco'),
});

export type ProgramWeekFormValues = z.infer<typeof programWeekFormSchema>;
export type TrainingBlockFormValues = z.infer<typeof trainingBlockFormSchema>;
export type ProgramFormValues = z.infer<typeof programFormSchema>;

export const programFormDefaultValues: ProgramFormValues = {
  name: '',
  description: '',
  durationWeeks: 4,
  blocks: [],
};
