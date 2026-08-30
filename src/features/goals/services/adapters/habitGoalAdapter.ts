import { habitsSourceSnapshot } from '../../mocks/habitsSourceData.mock';
import type { GoalProgressSource, GoalProgressSourceResult } from '../../types';

const metricValues: Record<string, number> = {
  'habit.executions': habitsSourceSnapshot.totalExecutions,
  'habit.streak': habitsSourceSnapshot.longestStreakDays,
  'habit.consistencyRate': habitsSourceSnapshot.consistencyRatePercent,
  'habit.daysCompleted': habitsSourceSnapshot.daysCompletedThisMonth,
};

/** `features/habits` doesn't exist yet (`/app/habitos` is a stub) — prepared the same way as `trainingGoalAdapter`; see `docs/goals.md`. */
export const habitGoalAdapter: GoalProgressSource = {
  module: 'habit',
  metrics: [
    { id: 'habit.executions', module: 'habit', label: 'Execuções', unit: 'times' },
    { id: 'habit.streak', module: 'habit', label: 'Sequência (streak)', unit: 'days' },
    {
      id: 'habit.consistencyRate',
      module: 'habit',
      label: 'Taxa de consistência',
      unit: 'percentage',
    },
    { id: 'habit.daysCompleted', module: 'habit', label: 'Dias cumpridos', unit: 'days' },
  ],
  async calculateProgress(_goal, metricId): Promise<GoalProgressSourceResult> {
    const metric = habitGoalAdapter.metrics.find((candidate) => candidate.id === metricId);
    return {
      currentValue: metricValues[metricId] ?? 0,
      unit: metric?.unit ?? 'units',
      lastSyncAt: new Date().toISOString(),
      detail: metric ? `${metricValues[metricId] ?? 0} registrados em Hábitos` : undefined,
    };
  },
};
