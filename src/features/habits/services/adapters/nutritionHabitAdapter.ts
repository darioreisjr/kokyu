import type { HabitSourceAdapter } from '../../types/adapters.types';

export const nutritionHabitAdapter: HabitSourceAdapter = {
  module: 'nutrition',
  label: 'Nutrição',
  metrics: [
    {
      id: 'nutrition.waterIntakeMl',
      module: 'nutrition',
      label: 'Consumo de Água (ml)',
      unit: 'units',
      description: 'Volume de água ingerido no dia.',
    },
    {
      id: 'nutrition.mealPlanCompleted',
      module: 'nutrition',
      label: 'Plano Alimentar Cumprido',
      unit: 'times',
      description: 'Refeições planejadas seguidas com sucesso.',
    },
  ],
  async getAvailableEvents() {
    return [];
  },
};
