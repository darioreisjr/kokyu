/** `missed` is never set by the user — it's derived at read time from a `planned` entry whose date has passed (see `trainingScheduleService.getTrainingCalendar`). */
export type TrainingScheduleEntryStatus =
  'planned' | 'completed' | 'skipped' | 'rescheduled' | 'rest' | 'missed';
export type TrainingScheduleRecurrence = 'once' | 'weekly' | 'program';

/** The seam a future Ritmo Diário `ScheduleEntry` adapter reads from — see `docs/training.md`. */
export interface TrainingScheduleEntry {
  id: string;
  /** `yyyy-MM-dd`. */
  date: string;
  /** `HH:mm`, optional. */
  time?: string;
  status: TrainingScheduleEntryStatus;
  routineId?: string;
  programId?: string;
  programWeekId?: string;
  sessionId?: string;
  estimatedDurationMinutes?: number;
  recurrence: TrainingScheduleRecurrence;
  reminder?: boolean;
  /** Pre-resolved display text (e.g. "Push A") — same trick as `GoalLink.entityLabel` in `features/goals`, so a future consumer never has to import training to show a name. */
  label: string;
  createdAt: string;
  updatedAt: string;
}

export type TrainingScheduleEntryInput = Omit<
  TrainingScheduleEntry,
  'id' | 'status' | 'sessionId' | 'createdAt' | 'updatedAt'
>;
