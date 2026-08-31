import { z } from 'zod';

export const habitLogContextSchema = z.object({
  mood: z.enum(['great', 'good', 'neutral', 'difficult', 'bad']).optional(),
  energyLevel: z.enum(['high', 'medium', 'low']).optional(),
  difficulty: z.enum(['easy', 'moderate', 'hard']).optional(),
  whatHelped: z.string().max(200).optional(),
  whatHindered: z.string().max(200).optional(),
  trigger: z.string().max(200).optional(),
  tags: z.array(z.string()).optional(),
});

export const habitLogSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (AAAA-MM-DD)'),
  value: z.number().min(0),
  status: z.enum(['completed', 'partial', 'skipped']),
  note: z.string().max(500).optional(),
  context: habitLogContextSchema.optional(),
});

export const plannedPauseSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início inválida'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de término inválida').optional(),
  reason: z.string().max(200).optional(),
});
