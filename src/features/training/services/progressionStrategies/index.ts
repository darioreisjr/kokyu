import type { ProgressionStrategyType } from '../../types';
import { doubleProgressionStrategy } from './doubleProgressionStrategy';
import { linearProgressionStrategy } from './linearStrategy';
import { manualProgressionStrategy } from './manualStrategy';
import { percentOfTrainingMaxStrategy } from './percentOfTrainingMaxStrategy';
import type { ProgressionStrategy } from './types';

const progressionStrategies: Record<ProgressionStrategyType, ProgressionStrategy> = {
  manual: manualProgressionStrategy,
  linear: linearProgressionStrategy,
  doubleProgression: doubleProgressionStrategy,
  percentOfTrainingMax: percentOfTrainingMaxStrategy,
};

export function getProgressionStrategy(type: ProgressionStrategyType): ProgressionStrategy {
  return progressionStrategies[type];
}

export {
  manualProgressionStrategy,
  linearProgressionStrategy,
  doubleProgressionStrategy,
  percentOfTrainingMaxStrategy,
};
export type {
  ProgressionHistorySession,
  ProgressionStrategy,
  ProgressionSuggestion,
} from './types';
