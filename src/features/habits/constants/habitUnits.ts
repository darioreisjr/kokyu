import type { HabitUnit } from '../types/habit.types';

export interface HabitUnitConfig {
  id: HabitUnit;
  label: string;
  singular: string;
  plural: string;
  defaultStep: number;
}

export const habitUnitConfigs: Record<HabitUnit, HabitUnitConfig> = {
  pages: { id: 'pages', label: 'Páginas', singular: 'página', plural: 'páginas', defaultStep: 5 },
  times: { id: 'times', label: 'Vezes', singular: 'vez', plural: 'vezes', defaultStep: 1 },
  cups: { id: 'cups', label: 'Copos', singular: 'copo', plural: 'copos', defaultStep: 1 },
  minutes: { id: 'minutes', label: 'Minutos', singular: 'minuto', plural: 'minutos', defaultStep: 5 },
  hours: { id: 'hours', label: 'Horas', singular: 'hora', plural: 'horas', defaultStep: 1 },
  km: { id: 'km', label: 'Km', singular: 'km', plural: 'km', defaultStep: 1 },
  units: { id: 'units', label: 'Unidades', singular: 'unidade', plural: 'unidades', defaultStep: 1 },
  words: { id: 'words', label: 'Palavras', singular: 'palavra', plural: 'palavras', defaultStep: 100 },
  lessons: { id: 'lessons', label: 'Lições', singular: 'lição', plural: 'lições', defaultStep: 1 },
  custom: { id: 'custom', label: 'Personalizado', singular: 'unidade', plural: 'unidades', defaultStep: 1 },
};

export function formatHabitUnit(unit: HabitUnit, value: number, customLabel?: string): string {
  if (unit === 'custom' && customLabel) {
    return customLabel;
  }
  const config = habitUnitConfigs[unit];
  if (!config) return customLabel ?? 'unidades';
  return Math.abs(value) === 1 ? config.singular : config.plural;
}

export function formatHabitValueWithUnit(value: number, unit: HabitUnit, customLabel?: string): string {
  const unitStr = formatHabitUnit(unit, value, customLabel);
  return `${value} ${unitStr}`;
}
