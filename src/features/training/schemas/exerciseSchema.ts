import { z } from 'zod';

import { exerciseTypeOptions, trackingTypeOptions } from '../constants/exerciseCategories';
import type { ExerciseType, TrackingType } from '../types';

const exerciseTypeValues = exerciseTypeOptions.map((option) => option.value) as [
  ExerciseType,
  ...ExerciseType[],
];
const trackingTypeValues = trackingTypeOptions.map((option) => option.value) as [
  TrackingType,
  ...TrackingType[],
];

export const exerciseFormSchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  exerciseType: z.enum(exerciseTypeValues),
  primaryMuscles: z.array(z.string()).min(1, 'Selecione ao menos um músculo principal'),
  secondaryMuscles: z.array(z.string()),
  equipmentIds: z.array(z.string()),
  trackingType: z.enum(trackingTypeValues),
  instructions: z.string(),
  personalNotes: z.string(),
});

export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

export const exerciseFormDefaultValues: ExerciseFormValues = {
  name: '',
  exerciseType: 'strength',
  primaryMuscles: [],
  secondaryMuscles: [],
  equipmentIds: [],
  trackingType: 'weightReps',
  instructions: '',
  personalNotes: '',
};
