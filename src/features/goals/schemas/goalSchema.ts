import { z } from 'zod';

const goalAreaValues = [
  'work',
  'routine',
  'training',
  'nutrition',
  'habits',
  'leisure',
  'personal',
  'other',
] as const;
const goalTypeValues = [
  'numeric',
  'binary',
  'milestone',
  'consistency',
  'average',
  'keyResult',
] as const;
const goalPriorityValues = ['low', 'medium', 'high', 'focus'] as const;
const goalDirectionValues = ['increase', 'decrease'] as const;
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
const progressModeValues = ['manual', 'automatic'] as const;
const checkInFrequencyValues = ['none', 'weekly', 'biweekly', 'monthly', 'custom'] as const;
const numericLikeTypes = ['numeric', 'consistency', 'average'];

/**
 * One flat schema for every `GoalType`, same reasoning as `leisureItemSchema` — `GoalFormPage`
 * only renders/reads the measurement fields relevant to the chosen type; the stored `Goal` builds
 * its proper `GoalMeasurement` discriminated union at submit time, not this schema.
 */
export const goalSchema = z
  .object({
    title: z.string().min(1, 'Informe um título'),
    description: z.string().optional(),
    area: z.enum(goalAreaValues, { message: 'Selecione uma área' }),
    type: z.enum(goalTypeValues, { message: 'Selecione como medir' }),
    priority: z.enum(goalPriorityValues),
    // Measurement — only some are read back, depending on `type`.
    direction: z.enum(goalDirectionValues).optional(),
    unit: z.enum(goalUnitValues).optional(),
    baseline: z.number().optional(),
    currentValue: z.number().optional(),
    targetValue: z.number().optional(),
    periodDays: z.number().min(1).optional(),
    allowOverachievement: z.boolean().optional(),
    startDate: z.string().min(1, 'Informe a data inicial'),
    targetDate: z.string().optional(),
    progressMode: z.enum(progressModeValues),
    sourceModule: z.string().optional(),
    sourceMetricId: z.string().optional(),
    tags: z.array(z.string()),
    motivation: z.string().optional(),
    successCriteria: z.string().optional(),
    checkInFrequency: z.enum(checkInFrequencyValues),
  })
  .refine(
    (data) =>
      data.progressMode !== 'automatic' || Boolean(data.sourceModule && data.sourceMetricId),
    {
      message: 'Selecione uma fonte automática',
      path: ['sourceMetricId'],
    },
  )
  .refine((data) => !numericLikeTypes.includes(data.type) || typeof data.targetValue === 'number', {
    message: 'Informe um alvo',
    path: ['targetValue'],
  });

export type GoalFormValues = z.infer<typeof goalSchema>;

export const goalFormDefaultValues: GoalFormValues = {
  title: '',
  description: '',
  area: 'personal',
  type: 'numeric',
  priority: 'medium',
  direction: 'increase',
  unit: 'units',
  baseline: 0,
  currentValue: 0,
  targetValue: undefined,
  allowOverachievement: false,
  startDate: '',
  targetDate: '',
  progressMode: 'manual',
  sourceModule: '',
  sourceMetricId: '',
  tags: [],
  motivation: '',
  successCriteria: '',
  checkInFrequency: 'none',
};
