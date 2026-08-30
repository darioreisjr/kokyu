export interface PlateBreakdown {
  /** Plates for ONE side of the bar, heaviest first — never the total. */
  platesPerSide: number[];
  achievedWeightKg: number;
  remainderKg: number;
  achievable: boolean;
}

/**
 * Greedy largest-plate-first breakdown — the standard, predictable way lifters load a bar.
 * `remainderKg` surfaces whenever the target can't be hit exactly with the available plates,
 * instead of silently rounding (per the spec's own "não inventar silenciosamente").
 */
export function calculatePlateBreakdown(
  targetWeightKg: number,
  barWeightKg: number,
  availablePlatesKg: number[],
): PlateBreakdown {
  const weightPerSide = (targetWeightKg - barWeightKg) / 2;

  if (weightPerSide <= 0) {
    return {
      platesPerSide: [],
      achievedWeightKg: barWeightKg,
      remainderKg: targetWeightKg - barWeightKg,
      achievable: weightPerSide === 0,
    };
  }

  const sortedPlates = [...availablePlatesKg].sort((a, b) => b - a);
  const platesPerSide: number[] = [];
  let remaining = weightPerSide;
  const EPSILON = 1e-6;

  for (const plate of sortedPlates) {
    if (plate <= 0) continue;
    while (remaining + EPSILON >= plate) {
      platesPerSide.push(plate);
      remaining -= plate;
    }
  }

  const loadedPerSide = platesPerSide.reduce((total, plate) => total + plate, 0);
  const achievedWeightKg = barWeightKg + loadedPerSide * 2;
  const remainderKg = Math.round((targetWeightKg - achievedWeightKg) * 100) / 100;

  return {
    platesPerSide,
    achievedWeightKg,
    remainderKg,
    achievable: Math.abs(remainderKg) < EPSILON,
  };
}
