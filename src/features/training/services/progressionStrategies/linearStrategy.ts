import type { ProgressionConfig, SetPrescription } from '../../types';
import type {
  ProgressionHistorySession,
  ProgressionStrategy,
  ProgressionSuggestion,
} from './types';

/** Bumps the load once the last `incrementAfterSuccesses` sessions each hit every working set's target. */
export function suggestNextLinear(
  config: ProgressionConfig,
  targetSets: SetPrescription[],
  history: ProgressionHistorySession[],
): ProgressionSuggestion | null {
  if (config.strategy !== 'linear') return null;

  const workingTargets = targetSets.filter((set) => set.setType === 'working');
  if (workingTargets.length === 0 || history.length < config.incrementAfterSuccesses) return null;

  const recentSessions = history.slice(0, config.incrementAfterSuccesses);
  const allSuccessful = recentSessions.every((session) =>
    workingTargets.every((target) => {
      const performed = session.performedSets.find((set) => set.setNumber === target.order);
      return Boolean(
        performed?.completed &&
        (performed.weightKg ?? 0) >= (target.targetLoadKg ?? 0) &&
        (performed.reps ?? 0) >= (target.targetReps ?? 0),
      );
    }),
  );
  if (!allSuccessful) return null;

  const currentLoad = Math.max(...workingTargets.map((set) => set.targetLoadKg ?? 0));
  const suggestedWeightKg = Math.round((currentLoad + config.incrementKg) * 100) / 100;

  return {
    suggestedWeightKg,
    rationale: `Você bateu a meta nas últimas ${config.incrementAfterSuccesses} sessões — considere subir para ${suggestedWeightKg}kg.`,
  };
}

export const linearProgressionStrategy: ProgressionStrategy = {
  strategy: 'linear',
  suggestNext: suggestNextLinear,
};
