import { DEFAULT_AVAILABLE_PLATES_KG, DEFAULT_BAR_WEIGHT_KG } from '../constants/defaultPlateSet';
import type { TrainingPreferences } from '../types';

export const mockTrainingPreferences: TrainingPreferences = {
  level: 'intermediate',
  primaryObjective: 'hypertrophy',
  sessionsPerWeek: 4,
  preferredDays: [1, 3, 5, 6],
  preferredDurationMinutes: 60,
  weightUnit: 'kg',
  defaultRestSeconds: 90,
  showRpeRir: true,
  showPreviousValues: true,
  autoStartRestTimer: true,
  defaultBarWeightKg: DEFAULT_BAR_WEIGHT_KG,
  availablePlatesKg: DEFAULT_AVAILABLE_PLATES_KG,
  e1rmFormula: 'epley',
  defaultLocationId: 'location-academia',
};
