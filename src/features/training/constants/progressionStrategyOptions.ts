import type { ProgressionConfig, ProgressionStrategyType } from '../types';

export const progressionStrategyLabels: Record<ProgressionStrategyType, string> = {
  manual: 'Manual',
  linear: 'Progressão linear',
  doubleProgression: 'Progressão dupla',
  percentOfTrainingMax: 'Percentual do training max',
};

export const progressionStrategyOptions: { value: ProgressionStrategyType; label: string }[] = (
  Object.keys(progressionStrategyLabels) as ProgressionStrategyType[]
).map((value) => ({ value, label: progressionStrategyLabels[value] }));

/** Sensible starting config per strategy — used when the user switches strategies in the Builder. */
export function createDefaultProgressionConfig(
  strategy: ProgressionStrategyType,
): ProgressionConfig {
  switch (strategy) {
    case 'manual':
      return { strategy: 'manual' };
    case 'linear':
      return { strategy: 'linear', incrementKg: 2.5, incrementAfterSuccesses: 1 };
    case 'doubleProgression':
      return { strategy: 'doubleProgression', repRangeMin: 8, repRangeMax: 12, incrementKg: 2.5 };
    case 'percentOfTrainingMax':
      return { strategy: 'percentOfTrainingMax', trainingMaxKg: 100, percentOfMax: 80 };
    default:
      return { strategy: 'manual' };
  }
}
