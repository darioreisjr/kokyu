import type { TrainingScheduleEntryStatus } from '../types';

/** "missed" uses non-punitive Portuguese ("Não realizado", not "Perdido"/"Falhou") per the spec's own explicit instruction. */
export const scheduleStatusLabels: Record<TrainingScheduleEntryStatus, string> = {
  planned: 'Planejado',
  completed: 'Concluído',
  skipped: 'Pulado',
  rescheduled: 'Reagendado',
  rest: 'Descanso',
  missed: 'Não realizado',
};

export const scheduleStatusChipColor: Record<
  TrainingScheduleEntryStatus,
  'default' | 'success' | 'warning' | 'info'
> = {
  planned: 'info',
  completed: 'success',
  skipped: 'default',
  rescheduled: 'info',
  rest: 'default',
  missed: 'warning',
};
