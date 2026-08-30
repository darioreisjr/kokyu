import type { GoalUnit } from '../types';

/** Every label a unit can render as — components never hardcode "livros"/"minutos" inline. */
const goalUnitLabels: Record<GoalUnit, { singular: string; plural: string }> = {
  times: { singular: 'vez', plural: 'vezes' },
  books: { singular: 'livro', plural: 'livros' },
  workouts: { singular: 'treino', plural: 'treinos' },
  hours: { singular: 'hora', plural: 'horas' },
  minutes: { singular: 'minuto', plural: 'minutos' },
  days: { singular: 'dia', plural: 'dias' },
  pages: { singular: 'página', plural: 'páginas' },
  recipes: { singular: 'receita', plural: 'receitas' },
  missions: { singular: 'missão', plural: 'missões' },
  percentage: { singular: '%', plural: '%' },
  km: { singular: 'km', plural: 'km' },
  units: { singular: 'unidade', plural: 'unidades' },
};

export const goalUnitOptions: { id: GoalUnit; label: string }[] = (
  Object.keys(goalUnitLabels) as GoalUnit[]
).map((id) => ({
  id,
  label: goalUnitLabels[id].plural,
}));

export function getGoalUnitLabel(unit: GoalUnit, value: number): string {
  const definition = goalUnitLabels[unit];
  if (unit === 'percentage' || unit === 'km') return definition.plural;
  return Math.abs(value) === 1 ? definition.singular : definition.plural;
}
