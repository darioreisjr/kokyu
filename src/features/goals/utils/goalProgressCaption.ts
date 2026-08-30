import { getGoalUnitLabel } from '../constants/goalUnits';
import type { GoalProgressResult } from '../services/progressStrategies';
import type { Goal } from '../types';
import { formatGoalProgressAccessibleLabel } from './goalFormatting';

/**
 * `GoalProgressResult.current`/`target` are already normalized per strategy (a milestone goal's
 * "target" is a total weight, not a real unit) — this turns that into the sentence a person
 * actually reads, per type. Shared by `GoalCard` and `GoalDetailPage` so the phrasing never drifts.
 */
export function getGoalProgressCaption(goal: Goal, progress: GoalProgressResult): string {
  if (goal.type === 'binary') {
    const measurement = goal.measurement as { completed: boolean };
    return measurement.completed ? 'Concluída.' : 'Ainda não concluída.';
  }

  if (goal.type === 'milestone') {
    const total = goal.milestones?.length ?? 0;
    const completed = goal.milestones?.filter((milestone) => milestone.completed).length ?? 0;
    return `${completed} de ${total} marcos concluídos (${progress.percent}%).`;
  }

  if (goal.type === 'keyResult') {
    const total = goal.keyResults?.length ?? 0;
    const completed =
      goal.keyResults?.filter((keyResult) => keyResult.status === 'completed').length ?? 0;
    return `${completed} de ${total} resultados concluídos (${progress.percent}%).`;
  }

  // "current de target" reads naturally for an increasing goal ("8 de 20 livros") but backwards
  // for a reduction goal, where the real value (140) sits *above* a lower target (90) — showing
  // "atual" vs. "alvo" instead avoids implying an overshoot when the goal is actually on track.
  if (goal.measurement.type === 'numeric' && goal.measurement.direction === 'decrease') {
    const unitLabel = getGoalUnitLabel(goal.measurement.unit, progress.current);
    return `Atual: ${progress.current} ${unitLabel} · Alvo: ${progress.target} (${progress.percent}%).`;
  }

  const unit =
    goal.measurement.type === 'numeric' ||
    goal.measurement.type === 'consistency' ||
    goal.measurement.type === 'average'
      ? goal.measurement.unit
      : 'units';
  return formatGoalProgressAccessibleLabel(
    progress.current,
    progress.target,
    unit,
    progress.percent,
  );
}
