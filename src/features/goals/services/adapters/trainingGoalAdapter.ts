import { trainingSourceSnapshot } from '../../mocks/trainingSourceData.mock';
import type { GoalProgressSource, GoalProgressSourceResult } from '../../types';

const metricValues: Record<string, number> = {
  'training.sessionsCompleted': trainingSourceSnapshot.sessionsCompletedThisYear,
  'training.minutesTrained': trainingSourceSnapshot.minutesTrainedThisYear,
  'training.weeklyFrequency': trainingSourceSnapshot.weeklyFrequency,
};

/**
 * `features/training` doesn't exist yet (`/app/treinamento` is a stub) — this adapter is prepared
 * against a self-contained snapshot so the contract and UI are ready the day that feature ships;
 * see `docs/goals.md`.
 */
export const trainingGoalAdapter: GoalProgressSource = {
  module: 'training',
  metrics: [
    {
      id: 'training.sessionsCompleted',
      module: 'training',
      label: 'Sessões concluídas',
      unit: 'workouts',
    },
    {
      id: 'training.minutesTrained',
      module: 'training',
      label: 'Minutos treinados',
      unit: 'minutes',
    },
    {
      id: 'training.weeklyFrequency',
      module: 'training',
      label: 'Frequência semanal',
      unit: 'times',
    },
  ],
  async calculateProgress(_goal, metricId): Promise<GoalProgressSourceResult> {
    const metric = trainingGoalAdapter.metrics.find((candidate) => candidate.id === metricId);
    return {
      currentValue: metricValues[metricId] ?? 0,
      unit: metric?.unit ?? 'units',
      lastSyncAt: new Date().toISOString(),
      detail: metric ? `${metricValues[metricId] ?? 0} registrados em Treinamento` : undefined,
    };
  },
};
