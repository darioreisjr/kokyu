import { missionsSourceSnapshot } from '../../mocks/missionsSourceData.mock';
import type { GoalProgressSource, GoalProgressSourceResult } from '../../types';

const metricValues: Record<string, number> = {
  'mission.completedCount': missionsSourceSnapshot.completedCount,
  'mission.completedInWork': missionsSourceSnapshot.completedByCategory.trabalho ?? 0,
  'mission.completedInPersonal': missionsSourceSnapshot.completedByCategory.pessoal ?? 0,
  'mission.portfolioProjectPercent': missionsSourceSnapshot.projectCompletionPercent.portfolio ?? 0,
};

/** `features/missions` doesn't exist yet (`/app/missoes` is a stub) — prepared the same way as `trainingGoalAdapter`; see `docs/goals.md`. */
export const missionGoalAdapter: GoalProgressSource = {
  module: 'mission',
  metrics: [
    {
      id: 'mission.completedCount',
      module: 'mission',
      label: 'Missões concluídas',
      unit: 'missions',
    },
    {
      id: 'mission.completedInWork',
      module: 'mission',
      label: 'Missões concluídas em Trabalho',
      unit: 'missions',
    },
    {
      id: 'mission.completedInPersonal',
      module: 'mission',
      label: 'Missões concluídas em Pessoal',
      unit: 'missions',
    },
    {
      id: 'mission.portfolioProjectPercent',
      module: 'mission',
      label: 'Percentual do projeto concluído',
      unit: 'percentage',
    },
  ],
  async calculateProgress(_goal, metricId): Promise<GoalProgressSourceResult> {
    const metric = missionGoalAdapter.metrics.find((candidate) => candidate.id === metricId);
    return {
      currentValue: metricValues[metricId] ?? 0,
      unit: metric?.unit ?? 'units',
      lastSyncAt: new Date().toISOString(),
      detail: metric ? `${metricValues[metricId] ?? 0} registrados em Missões` : undefined,
    };
  },
};
