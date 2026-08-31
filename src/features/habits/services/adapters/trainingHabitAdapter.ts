import type { HabitSourceAdapter } from '../../types/adapters.types';

export const trainingHabitAdapter: HabitSourceAdapter = {
  module: 'training',
  label: 'Treinamento',
  metrics: [
    {
      id: 'training.workoutCompleted',
      module: 'training',
      label: 'Treino Concluído',
      unit: 'times',
      description: 'Disparado quando um treino é finalizado.',
    },
    {
      id: 'training.durationMinutes',
      module: 'training',
      label: 'Duração do Treino',
      unit: 'minutes',
      description: 'Minutos totais de exercício físico registrado.',
    },
  ],
  async getAvailableEvents() {
    return [];
  },
};
