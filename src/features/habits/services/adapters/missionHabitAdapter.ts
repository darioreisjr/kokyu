import type { HabitSourceAdapter } from '../../types/adapters.types';

export const missionHabitAdapter: HabitSourceAdapter = {
  module: 'missions',
  label: 'Missões',
  metrics: [
    {
      id: 'missions.dailyMissionCompleted',
      module: 'missions',
      label: 'Missão do Dia Concluída',
      unit: 'times',
      description: 'Disparado quando a missão diária é concluída.',
    },
  ],
  async getAvailableEvents() {
    return [];
  },
};
