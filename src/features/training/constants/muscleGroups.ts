import type { MuscleGroup } from '../types';

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: 'Peito',
  back: 'Costas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraços',
  abs: 'Abdômen',
  lowerBack: 'Lombar',
  glutes: 'Glúteos',
  quads: 'Quadríceps',
  hamstrings: 'Posteriores de coxa',
  calves: 'Panturrilhas',
  adductors: 'Adutores',
  abductors: 'Abdutores',
  traps: 'Trapézio',
};

export const muscleGroupOptions: { value: MuscleGroup; label: string }[] = (
  Object.keys(muscleGroupLabels) as MuscleGroup[]
).map((value) => ({ value, label: muscleGroupLabels[value] }));
