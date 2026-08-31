import { z } from 'zod';

export const habitSchema = z.object({
  name: z.string().min(1, 'O nome do hábito é obrigatório').max(100, 'Máximo de 100 caracteres'),
  description: z.string().max(300, 'Máximo de 300 caracteres').optional(),
  area: z.enum([
    'routine',
    'work',
    'training',
    'nutrition',
    'habits',
    'leisure',
    'personal',
    'other',
  ]),
  direction: z.enum(['build', 'reduce', 'observe']),
  trackingType: z.enum(['binary', 'count', 'quantity', 'duration', 'limit', 'automatic']),

  // Target values
  targetValue: z.number().min(0).optional(),
  targetMinutes: z.number().min(1).optional(),
  minimumMinutes: z.number().min(1).optional(),
  maxLimit: z.number().min(0).optional(),
  unit: z.enum([
    'pages',
    'times',
    'cups',
    'minutes',
    'hours',
    'km',
    'units',
    'words',
    'lessons',
    'custom',
  ]).optional(),
  customUnitLabel: z.string().max(30).optional(),
  allowOverachievement: z.boolean().optional(),
  limitPeriod: z.enum(['day', 'week', 'month']).optional(),

  // Schedule
  frequencyType: z.enum([
    'daily',
    'specificDays',
    'flexibleWeekly',
    'flexibleMonthly',
    'interval',
    'weekdays',
    'weekends',
    'custom',
  ]),
  weekdays: z.array(z.number().min(0).max(6)).optional(),
  timesPerPeriod: z.number().min(1).optional(),
  intervalDays: z.number().min(1).optional(),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().optional(),
  effectiveFrom: z.string().optional(),

  // Time & Details
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'anytime', 'specific']),
  preferredTime: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'focus']).optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Motivations and Stacking
  motivation: z.string().max(500).optional(),
  cue: z.string().max(200).optional(),
  triggerHabitId: z.string().optional(),
  reward: z.string().max(200).optional(),

  // Integrations
  source: z.enum(['manual', 'training', 'nutrition', 'leisure', 'missions', 'schedule', 'external']),
  sourceMetricId: z.string().optional(),
  goalIds: z.array(z.string()).optional(),
  routineIds: z.array(z.string()).optional(),

  // Reminders
  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string().optional(),
});

export type HabitFormValues = z.infer<typeof habitSchema>;

export const habitFormDefaultValues: HabitFormValues = {
  name: '',
  description: '',
  area: 'routine',
  direction: 'build',
  trackingType: 'binary',
  frequencyType: 'daily',
  timeOfDay: 'anytime',
  startDate: new Date().toISOString().split('T')[0]!,
  source: 'manual',
  tags: [],
  goalIds: [],
  routineIds: [],
};
