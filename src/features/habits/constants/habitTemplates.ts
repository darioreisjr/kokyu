import type { HabitArea, HabitDirection, HabitTarget, HabitTimeOfDay, HabitTrackingType } from '../types/habit.types';
import type { HabitFrequencyType } from '../types/schedule.types';

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  area: HabitArea;
  direction: HabitDirection;
  trackingType: HabitTrackingType;
  target: HabitTarget;
  frequencyType: HabitFrequencyType;
  timeOfDay: HabitTimeOfDay;
  cue?: string;
  motivation?: string;
  tags: string[];
}

export const habitTemplates: HabitTemplate[] = [
  {
    id: 'tmpl-water',
    name: 'Beber 2.5L de água',
    description: 'Manter hidratação adequada durante o dia.',
    area: 'nutrition',
    direction: 'build',
    trackingType: 'quantity',
    target: { type: 'quantity', targetValue: 2500, unit: 'units', customUnitLabel: 'ml' },
    frequencyType: 'daily',
    timeOfDay: 'anytime',
    cue: 'Ao sentar na mesa de trabalho',
    motivation: 'Manter alta energia e disposição.',
    tags: ['saúde', 'água'],
  },
  {
    id: 'tmpl-reading',
    name: 'Ler 20 páginas',
    description: 'Leitura focada e aprendizado contínuo.',
    area: 'leisure',
    direction: 'build',
    trackingType: 'quantity',
    target: { type: 'quantity', targetValue: 20, unit: 'pages' },
    frequencyType: 'daily',
    timeOfDay: 'evening',
    cue: 'Antes de dormir',
    motivation: 'Aprender algo novo todos os dias.',
    tags: ['leitura', 'estudo'],
  },
  {
    id: 'tmpl-meditation',
    name: 'Meditar 10 minutos',
    description: 'Pausa consciente de respiração e presença.',
    area: 'personal',
    direction: 'build',
    trackingType: 'duration',
    target: { type: 'duration', targetMinutes: 10, minimumMinutes: 5 },
    frequencyType: 'daily',
    timeOfDay: 'morning',
    cue: 'Logo após acordar e escovar os dentes',
    motivation: 'Começar o dia com calma e foco.',
    tags: ['mente', 'calma'],
  },
  {
    id: 'tmpl-workout',
    name: 'Treinar musculação 4x/semana',
    description: 'Sessões de musculação para força e postura.',
    area: 'training',
    direction: 'build',
    trackingType: 'count',
    target: { type: 'count', targetValue: 4 },
    frequencyType: 'flexibleWeekly',
    timeOfDay: 'afternoon',
    cue: 'Após o término do horário de trabalho',
    motivation: 'Construir força e saúde a longo prazo.',
    tags: ['treino', 'saúde'],
  },
  {
    id: 'tmpl-caffeine',
    name: 'Sem café após 16h',
    description: 'Evitar estimulantes no final da tarde para preservar o sono.',
    area: 'personal',
    direction: 'reduce',
    trackingType: 'limit',
    target: { type: 'limit', maxLimit: 0, period: 'day' },
    frequencyType: 'daily',
    timeOfDay: 'afternoon',
    cue: 'Ao pensar em tomar café à tarde',
    motivation: 'Dormir profundamente e sem despertares.',
    tags: ['sono', 'saúde'],
  },
];
