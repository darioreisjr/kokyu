import type { HabitSourceAdapter } from '../../types/adapters.types';

export const goalHabitAdapter: HabitSourceAdapter = {
  module: 'external',
  label: 'Metas',
  metrics: [
    {
      id: 'goals.checkInDone',
      module: 'external',
      label: 'Check-in de Meta Realizado',
      unit: 'times',
      description: 'Reflexão periódica de meta registrada.',
    },
  ],
  async getAvailableEvents() {
    return [];
  },
};
