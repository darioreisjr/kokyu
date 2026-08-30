import type { RoutineExercise } from '../types';
import {
  getProgressionStrategy,
  type ProgressionHistorySession,
  type ProgressionSuggestion,
} from './progressionStrategies';

/**
 * Single entry point for "should this exercise's load change next session" — components call this,
 * never a strategy directly (mirrors `features/goals`' `goalProgressEngine`). Never mutates
 * anything itself; callers decide whether/how to surface the suggestion.
 */
export function suggestNextPrescription(
  routineExercise: RoutineExercise,
  history: ProgressionHistorySession[],
): ProgressionSuggestion | null {
  const strategy = getProgressionStrategy(routineExercise.progression.strategy);
  return strategy.suggestNext(routineExercise.progression, routineExercise.sets, history);
}
