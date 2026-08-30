import type { WeightUnit } from '../types';

const KG_PER_LB = 0.45359237;

/**
 * Every stored weight is always kg — this is the ONLY place that ever converts for display or
 * input. `PersonalRecordEngine`, `TrainingAnalyticsService`, `PlateCalculator`, etc. never see
 * anything but kg, so kg/lb never gets mixed inside a calculation (per the spec's own "kg e lb
 * misturados" as an explicit non-goal).
 */
export function toDisplayWeight(weightKg: number, unit: WeightUnit): number {
  return unit === 'lb' ? weightKg / KG_PER_LB : weightKg;
}

export function toKg(displayWeight: number, unit: WeightUnit): number {
  return unit === 'lb' ? displayWeight * KG_PER_LB : displayWeight;
}

export function formatWeight(weightKg: number, unit: WeightUnit): string {
  const displayValue = toDisplayWeight(weightKg, unit);
  const rounded = Math.round(displayValue * 10) / 10;
  const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${formatted}${unit}`;
}
