import { z } from 'zod';

export const missionProjectSchema = z.object({
  name: z.string().min(1, 'O nome do projeto é obrigatório').max(150, 'Máximo de 150 caracteres'),
  description: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
  areaId: z
    .enum(['work', 'routine', 'training', 'nutrition', 'habits', 'leisure', 'personal', 'other'])
    .optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  colorToken: z.string().optional(),
  icon: z.string().optional(),
  goalIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type MissionProjectFormValues = z.infer<typeof missionProjectSchema>;

export const missionProjectFormDefaultValues: MissionProjectFormValues = {
  name: '',
  goalIds: [],
  tags: [],
};
