import { missionsSourceSnapshot } from '../../mocks/missionsSourceData.mock';
import type { GoalProgressSource, GoalProgressSourceResult } from '../../types';

const metricValues: Record<string, number> = {
  'mission.completedCount': missionsSourceSnapshot.completedCount,
  'mission.completedInWork': missionsSourceSnapshot.completedByCategory.trabalho ?? 0,
  'mission.completedInPersonal': missionsSourceSnapshot.completedByCategory.pessoal ?? 0,
  'mission.portfolioProjectPercent': missionsSourceSnapshot.projectCompletionPercent.portfolio ?? 0,
};

/**
 * `features/missions` exists now, but `goals` still can't import its service directly — the same
 * dependency rule that keeps `leisureGoalAdapter`/`nutritionGoalAdapter` on a local snapshot even
 * though those features are fully built (see `docs/goals.md#integração-real-vs-preparada`).
 * `mocks/missionsSourceData.mock.ts` is hand-kept in the same shape as `features/missions/mocks/missions.mock.ts`'s
 * seed data so the numbers stay representative.
 */
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
