export type MissionActivityType =
  | 'created'
  | 'updated'
  | 'planned'
  | 'scheduled'
  | 'rescheduled'
  | 'started'
  | 'completed'
  | 'reopened'
  | 'waiting'
  | 'blocked'
  | 'unblocked'
  | 'priorityChanged'
  | 'deadlineChanged'
  | 'projectChanged'
  | 'cancelled'
  | 'archived';

/** Append-only — never mutated, never deleted. Reopening a mission adds a `reopened` event; it never removes the earlier `completed` one. */
export interface MissionActivity {
  id: string;
  missionId: string;
  type: MissionActivityType;
  detail?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
