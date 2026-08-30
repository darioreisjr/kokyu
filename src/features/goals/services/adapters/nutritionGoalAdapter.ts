import { nutritionSourceSnapshot } from '../../mocks/nutritionSourceData.mock';
import type { GoalProgressSource, GoalProgressSourceResult } from '../../types';

const metricValues: Record<string, number> = {
  'nutrition.recipesCooked': nutritionSourceSnapshot.recipesCookedThisYear,
  'nutrition.mealsPlanned': nutritionSourceSnapshot.mealsPlannedThisYear,
  'nutrition.weeksWithPlanCompleted': nutritionSourceSnapshot.weeksWithPlanCompleted,
  'nutrition.homeCookedWeeks': nutritionSourceSnapshot.homeCookedWeeksThisYear,
};

/** Reads Nutrição's planner/recipe history (mirrored locally, see `nutritionSourceData.mock.ts`) — only non-medical, behavior-shaped metrics, per the spec's own "não criar métricas médicas". */
export const nutritionGoalAdapter: GoalProgressSource = {
  module: 'nutrition',
  metrics: [
    {
      id: 'nutrition.recipesCooked',
      module: 'nutrition',
      label: 'Receitas preparadas',
      unit: 'recipes',
    },
    {
      id: 'nutrition.mealsPlanned',
      module: 'nutrition',
      label: 'Refeições planejadas realizadas',
      unit: 'times',
    },
    {
      id: 'nutrition.weeksWithPlanCompleted',
      module: 'nutrition',
      label: 'Semanas com planejamento concluído',
      unit: 'times',
    },
    {
      id: 'nutrition.homeCookedWeeks',
      module: 'nutrition',
      label: 'Semanas cozinhando em casa',
      unit: 'times',
    },
  ],
  async calculateProgress(_goal, metricId): Promise<GoalProgressSourceResult> {
    const metric = nutritionGoalAdapter.metrics.find((candidate) => candidate.id === metricId);
    return {
      currentValue: metricValues[metricId] ?? 0,
      unit: metric?.unit ?? 'units',
      lastSyncAt: new Date().toISOString(),
      detail: metric ? `${metricValues[metricId] ?? 0} registrados em Nutrição` : undefined,
    };
  },
};
