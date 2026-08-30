import type { ProgramStatus, TrainingBlockType } from '../types';

export const programStatusLabels: Record<ProgramStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  paused: 'Pausado',
  completed: 'Concluído',
  archived: 'Arquivado',
};

export const trainingBlockTypeLabels: Record<TrainingBlockType, string> = {
  base: 'Base',
  accumulation: 'Acumulação',
  intensification: 'Intensificação',
  peak: 'Pico',
  deload: 'Redução',
  custom: 'Personalizado',
};

export const trainingBlockTypeOptions: { value: TrainingBlockType; label: string }[] = (
  Object.keys(trainingBlockTypeLabels) as TrainingBlockType[]
).map((value) => ({ value, label: trainingBlockTypeLabels[value] }));

export const weekdayShortLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const weekdayFullLabels = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
