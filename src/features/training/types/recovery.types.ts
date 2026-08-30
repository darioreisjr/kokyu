import type { MuscleGroup } from './exercise.types';

export interface RecoveryCheckIn {
  id: string;
  date: string;
  /** 1–5 self-reported scales — informational only, never diagnostic. */
  energyLevel: number;
  disposition: number;
  muscleSoreness: number;
  notes?: string;
  createdAt: string;
}

export type RecoveryCheckInInput = Omit<RecoveryCheckIn, 'id' | 'createdAt'>;

export type RecoveryLabel = 'recentlyTrained' | 'partiallyRested' | 'wellRested';

/** Always presented to the user as an estimate, never a medical measurement — see `docs/training.md`. */
export interface MuscleRecoveryEstimate {
  muscleGroup: MuscleGroup;
  label: RecoveryLabel;
  estimatedRecoveryPercent: number;
  lastTrainedAt?: string;
  hoursSinceTrained?: number;
}
