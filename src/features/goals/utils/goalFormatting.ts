import { getGoalUnitLabel } from '../constants/goalUnits';
import type { GoalUnit } from '../types';
import { getDaysUntil } from './dateHelpers';

/** Never "Meta perdida"/"Você falhou" — a passed deadline is neutral information, not a verdict (see the spec's own "NÃO PUNIR"). */
export function formatGoalDeadline(targetDate: string | undefined, now: Date = new Date()): string {
  if (!targetDate) return 'Sem prazo';
  const days = getDaysUntil(targetDate, now);
  if (days > 1) return `Faltam ${days} dias`;
  if (days === 1) return 'Falta 1 dia';
  if (days === 0) return 'Prazo é hoje';
  return 'Prazo ultrapassado';
}

/**
 * The accessible-text equivalent every progress bar/ring renders alongside its visual — a screen
 * reader (or a chart-less summary) never depends on color/shape alone. See the spec's own
 * "Progresso: 8 de 20 livros, 40%."
 */
export function formatGoalProgressAccessibleLabel(
  current: number,
  target: number,
  unit: GoalUnit,
  percent: number,
): string {
  const roundedCurrent = Math.round(current * 10) / 10;
  const roundedTarget = Math.round(target * 10) / 10;
  return `Progresso: ${roundedCurrent} de ${roundedTarget} ${getGoalUnitLabel(unit, roundedTarget)}, ${percent}%.`;
}
