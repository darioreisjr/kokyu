import type { MuscleGroup, MuscleRecoveryEstimate, RecoveryCheckIn, RecoveryLabel } from '../types';

const BASE_RECOVERY_HOURS = 24;
const HOURS_PER_DIRECT_SET = 4;
const MAX_RECOVERY_HOURS = 96;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Deliberately simple and transparent (per the spec's own "não imitar algoritmos proprietários"):
 * hours needed to recover scales with how many direct sets the muscle recently took, an objective
 * time-based percent is computed against that, and — when a check-in exists — blended 50/50 with
 * the user's own reported soreness. Always presented as an estimate, never a diagnosis.
 */
export function estimateMuscleRecovery(
  muscleGroup: MuscleGroup,
  hoursSinceTrained: number | undefined,
  recentDirectSets: number,
  latestCheckIn?: RecoveryCheckIn,
): MuscleRecoveryEstimate {
  if (hoursSinceTrained === undefined) {
    return { muscleGroup, label: 'wellRested', estimatedRecoveryPercent: 100 };
  }

  const neededHours = Math.min(
    MAX_RECOVERY_HOURS,
    BASE_RECOVERY_HOURS + recentDirectSets * HOURS_PER_DIRECT_SET,
  );
  const objectivePercent = clamp((hoursSinceTrained / neededHours) * 100, 0, 100);

  const subjectivePercent = latestCheckIn
    ? clamp(((6 - latestCheckIn.muscleSoreness) / 5) * 100, 0, 100)
    : undefined;

  const estimatedRecoveryPercent = Math.round(
    subjectivePercent === undefined ? objectivePercent : (objectivePercent + subjectivePercent) / 2,
  );

  const label: RecoveryLabel =
    estimatedRecoveryPercent < 40
      ? 'recentlyTrained'
      : estimatedRecoveryPercent < 75
        ? 'partiallyRested'
        : 'wellRested';

  return { muscleGroup, label, estimatedRecoveryPercent, hoursSinceTrained };
}
