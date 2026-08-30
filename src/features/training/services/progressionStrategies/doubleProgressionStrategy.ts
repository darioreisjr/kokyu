import type { ProgressionConfig, SetPrescription } from '../../types';
import type {
  ProgressionHistorySession,
  ProgressionStrategy,
  ProgressionSuggestion,
} from './types';

/** Only suggests a load increase once EVERY working set in the most recent session reached the top of the rep range — one short set holds it back, per the spec's own worked example. */
export function suggestNextDoubleProgression(
  config: ProgressionConfig,
  targetSets: SetPrescription[],
  history: ProgressionHistorySession[],
): ProgressionSuggestion | null {
  if (config.strategy !== 'doubleProgression') return null;

  const workingTargets = targetSets.filter((set) => set.setType === 'working');
  const latest = history[0];
  if (workingTargets.length === 0 || !latest) return null;

  const allHitTopOfRange = workingTargets.every((target) => {
    const performed = latest.performedSets.find((set) => set.setNumber === target.order);
    return Boolean(performed?.completed && (performed.reps ?? 0) >= config.repRangeMax);
  });
  if (!allHitTopOfRange) return null;

  const currentLoad = Math.max(
    0,
    ...latest.performedSets.filter((set) => set.completed).map((set) => set.weightKg ?? 0),
  );
  const suggestedWeightKg = Math.round((currentLoad + config.incrementKg) * 100) / 100;

  return {
    suggestedWeightKg,
    suggestedReps: config.repRangeMin,
    rationale: `Você atingiu ${config.repRangeMax} repetições em todas as séries. Considere aumentar a carga para ${suggestedWeightKg}kg e voltar para ${config.repRangeMin} repetições.`,
  };
}

export const doubleProgressionStrategy: ProgressionStrategy = {
  strategy: 'doubleProgression',
  suggestNext: suggestNextDoubleProgression,
};
