import type { GoalProgressSource, GoalSourceModule } from '../../types';
import { habitGoalAdapter } from './habitGoalAdapter';
import { leisureGoalAdapter } from './leisureGoalAdapter';
import { missionGoalAdapter } from './missionGoalAdapter';
import { nutritionGoalAdapter } from './nutritionGoalAdapter';
import { trainingGoalAdapter } from './trainingGoalAdapter';

/** Every automatic-progress source Goals knows about — the creation flow's Etapa 6 and `GoalProgressEngine` both read from here instead of hardcoding a module. */
const goalProgressSources: Record<GoalSourceModule, GoalProgressSource> = {
  leisure: leisureGoalAdapter,
  nutrition: nutritionGoalAdapter,
  habit: habitGoalAdapter,
  training: trainingGoalAdapter,
  mission: missionGoalAdapter,
};

export function getGoalProgressSource(module: GoalSourceModule): GoalProgressSource {
  return goalProgressSources[module];
}

export function getAllGoalProgressSources(): GoalProgressSource[] {
  return Object.values(goalProgressSources);
}

export {
  habitGoalAdapter,
  leisureGoalAdapter,
  missionGoalAdapter,
  nutritionGoalAdapter,
  trainingGoalAdapter,
};
