import type {
  PerformedSet,
  ProgressionConfig,
  ProgressionStrategyType,
  SetPrescription,
} from '../../types';

export interface ProgressionSuggestion {
  suggestedWeightKg?: number;
  suggestedReps?: number;
  rationale: string;
}

/** One past session's performed sets for the exercise being evaluated, most-recent-first. */
export interface ProgressionHistorySession {
  performedSets: PerformedSet[];
  startedAt: string;
}

export interface ProgressionStrategy {
  strategy: ProgressionStrategyType;
  suggestNext: (
    config: ProgressionConfig,
    targetSets: SetPrescription[],
    history: ProgressionHistorySession[],
  ) => ProgressionSuggestion | null;
}
