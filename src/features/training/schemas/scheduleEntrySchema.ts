import { z } from 'zod';

export const scheduleEntryFormSchema = z.object({
  routineId: z.string().min(1, 'Selecione uma rotina'),
  date: z.date(),
  time: z.string(),
  estimatedDurationMinutes: z.number().min(0).optional(),
  recurrence: z.enum(['once', 'weekly']),
  reminder: z.boolean(),
});

export type ScheduleEntryFormValues = z.infer<typeof scheduleEntryFormSchema>;

export const scheduleEntryFormDefaultValues: ScheduleEntryFormValues = {
  routineId: '',
  date: new Date(),
  time: '',
  recurrence: 'once',
  reminder: false,
};
