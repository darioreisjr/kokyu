import { z } from 'zod';

const setPrescriptionFormSchema = z.object({
  id: z.string(),
  order: z.number(),
  setType: z.enum(['warmup', 'working', 'drop', 'backoff', 'amrap', 'failure', 'timed']),
  targetReps: z.number().min(0).optional(),
  targetRepsMax: z.number().min(0).optional(),
  targetLoadKg: z.number().min(0).optional(),
  targetDurationSeconds: z.number().min(0).optional(),
  restSeconds: z.number().min(0),
  targetRpe: z.number().min(1).max(10).optional(),
  targetRir: z.number().min(0).max(10).optional(),
  tempo: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Flattens `ProgressionConfig`'s discriminated union into optional sibling fields — much easier
 * for `react-hook-form` to manage than a nested union per row. `utils/routineFormMapper.ts` is the
 * only place that folds this back into the real `ProgressionConfig` shape.
 */
const routineExerciseFormSchema = z.object({
  id: z.string(),
  exerciseId: z.string().min(1, 'Selecione um exercício'),
  order: z.number(),
  sets: z.array(setPrescriptionFormSchema).min(1, 'Adicione ao menos uma série'),
  groupId: z.string().optional(),
  progressionStrategy: z.enum(['manual', 'linear', 'doubleProgression', 'percentOfTrainingMax']),
  incrementKg: z.number().min(0).optional(),
  incrementAfterSuccesses: z.number().min(1).optional(),
  repRangeMin: z.number().min(1).optional(),
  repRangeMax: z.number().min(1).optional(),
  trainingMaxKg: z.number().min(0).optional(),
  percentOfMax: z.number().min(1).max(100).optional(),
  notes: z.string().optional(),
});

export const routineFormSchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  description: z.string().optional(),
  goal: z
    .enum(['strength', 'hypertrophy', 'conditioning', 'muscularEndurance', 'general', 'custom'])
    .optional(),
  estimatedDurationMinutes: z.number().min(0).optional(),
  locationId: z.string().optional(),
  exercises: z.array(routineExerciseFormSchema).min(1, 'Adicione ao menos um exercício'),
});

export type RoutineExerciseFormValues = z.infer<typeof routineExerciseFormSchema>;
export type SetPrescriptionFormValues = z.infer<typeof setPrescriptionFormSchema>;
export type RoutineFormValues = z.infer<typeof routineFormSchema>;

export const routineFormDefaultValues: RoutineFormValues = {
  name: '',
  description: '',
  exercises: [],
};
