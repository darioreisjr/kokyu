import type { HabitSourceAdapter } from '../../types/adapters.types';

export const scheduleHabitAdapter: HabitSourceAdapter = {
  module: 'schedule',
  label: 'Agenda',
  metrics: [
    {
      id: 'schedule.eventAttended',
      module: 'schedule',
      label: 'Compromisso Realizado',
      unit: 'times',
      description: 'Evento da agenda concluído.',
    },
  ],
  async getAvailableEvents() {
    return [];
  },
};
