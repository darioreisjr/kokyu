import type { GoalSourceModule } from './goal.types';

export type GoalLinkEntityType = GoalSourceModule | 'scheduleEntry';

export type GoalLinkRelationshipType = 'contributesTo' | 'tracks' | 'supports';

/**
 * Relates a goal to an entity in another module without `goals` ever importing that module's
 * code — `entityLabel` is denormalized at link time precisely so the UI never needs to reach
 * across the feature boundary to render it.
 */
export interface GoalLink {
  id: string;
  goalId: string;
  entityType: GoalLinkEntityType;
  entityId: string;
  entityLabel: string;
  relationshipType: GoalLinkRelationshipType;
  /** Denormalized at link time/on refresh — whether the linked entity itself is done. Only meaningful for "O que está contribuindo"; never fed into the goal's own progress calculation. */
  completed?: boolean;
  createdAt: string;
}
