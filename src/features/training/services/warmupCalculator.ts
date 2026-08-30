export interface WarmupSet {
  percentOfWorkingWeight: number;
  weightKg: number;
  reps: number;
}

/**
 * A simple, transparent progression from ~40% to ~90% of the working weight with descending reps
 * — not a scientific ramp, and never presented as injury prevention (per the spec's own "não
 * apresentar como prevenção garantida de lesão").
 */
export function calculateWarmupSets(
  workingWeightKg: number,
  workingReps: number,
  setCount = 3,
): WarmupSet[] {
  if (workingWeightKg <= 0 || setCount <= 0) return [];

  const steps = Math.max(setCount - 1, 1);
  const startPercent = 0.4;
  const endPercent = 0.9;
  const startReps = Math.min(8, Math.max(workingReps, 3));
  const endReps = Math.min(3, startReps);

  return Array.from({ length: setCount }, (_, index) => {
    const percent =
      Math.round((startPercent + ((endPercent - startPercent) * index) / steps) * 100) / 100;
    const reps = Math.max(1, Math.round(startReps - ((startReps - endReps) * index) / steps));
    // Round to the nearest 0.25kg — the finest plate increment most gyms have.
    const weightKg = Math.round(workingWeightKg * percent * 4) / 4;
    return { percentOfWorkingWeight: percent, weightKg, reps };
  });
}
