import type { ProgressionConfig } from '../../types';
import type { ProgressionStrategy, ProgressionSuggestion } from './types';

/** Stateless — always derived straight from `trainingMaxKg`/`percentOfMax`, never from session history. */
export function suggestNextPercentOfTrainingMax(
  config: ProgressionConfig,
): ProgressionSuggestion | null {
  if (config.strategy !== 'percentOfTrainingMax') return null;

  // Round to the nearest 0.25kg, the finest plate increment most gyms have.
  const suggestedWeightKg = Math.round(config.trainingMaxKg * (config.percentOfMax / 100) * 4) / 4;

  return {
    suggestedWeightKg,
    rationale: `${config.percentOfMax}% do training max de ${config.trainingMaxKg}kg.`,
  };
}

export const percentOfTrainingMaxStrategy: ProgressionStrategy = {
  strategy: 'percentOfTrainingMax',
  suggestNext: (config) => suggestNextPercentOfTrainingMax(config),
};
