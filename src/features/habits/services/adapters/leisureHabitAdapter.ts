import type { HabitSourceAdapter } from '../../types/adapters.types';

export const leisureHabitAdapter: HabitSourceAdapter = {
  module: 'leisure',
  label: 'Tempo Livre & Leitura',
  metrics: [
    {
      id: 'leisure.pagesRead',
      module: 'leisure',
      label: 'Páginas Lidas',
      unit: 'pages',
      description: 'Páginas de livros lidas e registradas.',
    },
    {
      id: 'leisure.readingSessionMinutes',
      module: 'leisure',
      label: 'Tempo de Leitura (minutos)',
      unit: 'minutes',
      description: 'Duração das sessões de leitura de livros.',
    },
  ],
  async getAvailableEvents() {
    return [];
  },
};
