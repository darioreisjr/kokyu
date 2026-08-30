import type { GoalArea, GoalSourceModule, GoalType, GoalUnit } from './goal.types';

/** A starting point offered during creation — never a value the user is forced to keep. */
export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  area: GoalArea;
  type: GoalType;
  /** `generic` — a reusable shape ("Projeto", "Consistência"); `integrated` — tied to a specific Kokyu module's automatic source. */
  category: 'generic' | 'integrated';
  suggestedUnit?: GoalUnit;
  suggestedSource?: { module: GoalSourceModule; metricId: string };
}
