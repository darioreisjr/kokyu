import type {
  ExerciseDifficulty,
  ExercisePreference,
  ExerciseType,
  MovementPattern,
  TrackingType,
} from '../types';

export const exerciseTypeLabels: Record<ExerciseType, string> = {
  strength: 'Força',
  bodyweight: 'Peso corporal',
  cardio: 'Cardio',
  mobility: 'Mobilidade',
  stretch: 'Alongamento',
  timed: 'Temporizado',
  custom: 'Personalizado',
};

export const exerciseTypeOptions: { value: ExerciseType; label: string }[] = (
  Object.keys(exerciseTypeLabels) as ExerciseType[]
).map((value) => ({ value, label: exerciseTypeLabels[value] }));

export const trackingTypeLabels: Record<TrackingType, string> = {
  weightReps: 'Peso e repetições',
  reps: 'Repetições',
  time: 'Tempo',
  distanceTime: 'Distância e tempo',
  weightTime: 'Peso e tempo',
  distance: 'Distância',
  custom: 'Personalizado',
};

export const trackingTypeOptions: { value: TrackingType; label: string }[] = (
  Object.keys(trackingTypeLabels) as TrackingType[]
).map((value) => ({ value, label: trackingTypeLabels[value] }));

export const movementPatternLabels: Record<MovementPattern, string> = {
  push: 'Empurrar',
  pull: 'Puxar',
  squat: 'Agachamento',
  hinge: 'Dobradiça de quadril',
  lunge: 'Avanço',
  carry: 'Carregada',
  rotation: 'Rotação',
  isolation: 'Isolamento',
};

export const difficultyLabels: Record<ExerciseDifficulty, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export const exercisePreferenceLabels: Record<ExercisePreference, string> = {
  preferred: 'Prefiro',
  neutral: 'Normal',
  lessPreferred: 'Evitar',
  excluded: 'Não usar',
};

export const exercisePreferenceOptions: { value: ExercisePreference; label: string }[] = (
  Object.keys(exercisePreferenceLabels) as ExercisePreference[]
).map((value) => ({ value, label: exercisePreferenceLabels[value] }));
