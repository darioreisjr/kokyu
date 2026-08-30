import { z } from 'zod';

const goalUnitValues = [
  'times',
  'books',
  'workouts',
  'hours',
  'minutes',
  'days',
  'pages',
  'recipes',
  'missions',
  'percentage',
  'km',
  'units',
] as const;

export const keyResultSchema = z.object({
  title: z.string().min(1, 'Informe um título'),
  type: z.enum(['numeric', 'binary']),
  baseline: z.number(),
  current: z.number(),
  target: z.number(),
  unit: z.enum(goalUnitValues),
  weight: z.number().min(0).max(100).optional(),
});

export type KeyResultFormValues = z.infer<typeof keyResultSchema>;

export const keyResultFormDefaultValues: KeyResultFormValues = {
  title: '',
  type: 'numeric',
  baseline: 0,
  current: 0,
  target: 0,
  unit: 'units',
};
