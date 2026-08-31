import { z } from 'zod';

export const routineSchema = z.object({
  name: z.string().min(1, 'O nome da rotina é obrigatório').max(100, 'Máximo de 100 caracteres'),
  description: z.string().max(300, 'Máximo de 300 caracteres').optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'anytime']),
  preferredTime: z.string().optional(),
  estimatedDurationMinutes: z.number().min(1).optional(),
  habitIds: z.array(z.string()).min(1, 'A rotina precisa de pelo menos 1 hábito'),
  reminder: z.string().optional(),
  colorToken: z.string().optional(),
  icon: z.string().optional(),
});

export type RoutineFormValues = z.infer<typeof routineSchema>;

export const routineFormDefaultValues: RoutineFormValues = {
  name: '',
  description: '',
  timeOfDay: 'morning',
  habitIds: [],
};
