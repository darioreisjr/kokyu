import { z } from 'zod';

export const habitReviewSchema = z.object({
  type: z.enum(['weekly', 'monthly']),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  whatWorked: z.string().max(500).optional(),
  whatWasHard: z.string().max(500).optional(),
  changesPlanned: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

export type HabitReviewFormValues = z.infer<typeof habitReviewSchema>;
