export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingObjective =
  'strength' | 'hypertrophy' | 'conditioning' | 'muscularEndurance' | 'general' | 'custom';
export type WeightUnit = 'kg' | 'lb';
/** Centralized so the estimate is never framed as an exact measurement — see `estimatedOneRepMaxCalculator.ts`. */
export type E1RMFormula = 'epley' | 'brzycki';

export interface TrainingPreferences {
  level?: TrainingLevel;
  primaryObjective?: TrainingObjective;
  sessionsPerWeek?: number;
  /** 0–6 (`Date#getDay()`). */
  preferredDays?: number[];
  preferredDurationMinutes?: number;
  weightUnit: WeightUnit;
  defaultRestSeconds: number;
  showRpeRir: boolean;
  showPreviousValues: boolean;
  autoStartRestTimer: boolean;
  defaultBarWeightKg: number;
  availablePlatesKg: number[];
  e1rmFormula: E1RMFormula;
  defaultLocationId?: string;
}
