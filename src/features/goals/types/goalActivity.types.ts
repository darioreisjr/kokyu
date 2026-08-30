export type GoalActivityType =
  | 'created'
  | 'progressUpdated'
  | 'statusChanged'
  | 'targetChanged'
  | 'deadlineChanged'
  | 'milestoneCompleted'
  | 'checkIn'
  | 'linkedEntityAdded'
  | 'linkedEntityRemoved'
  | 'paused'
  | 'resumed'
  | 'completed'
  | 'reopened'
  | 'abandoned'
  | 'archived'
  | 'replanned';

/** The change log behind `/app/metas/[id]`'s Histórico and `/app/metas/historico` — every meaningful mutation is recorded, never silently applied. */
export interface GoalActivity {
  id: string;
  goalId: string;
  type: GoalActivityType;
  description: string;
  metadata?: Record<string, string | number | boolean | undefined>;
  createdAt: string;
}
