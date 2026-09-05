import type {
  DailyCapacity,
  FreeTimeSlot,
  ScheduleConflict,
  ScheduleEntry,
} from '@/shared/scheduling/types';

// Local, self-contained unions rather than importing each feature's own
// type (e.g. `GoalStatus`, `LeisureItemType`) — `shared/*` never depends
// on `features/*`, the same way `shared/scheduling`'s `ScheduleEntry`
// never imports a feature type either. Values are kept in sync by hand
// with each feature's own union; a provider narrows into these at the
// boundary instead of these types reaching into the feature.
export type HomeTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime' | 'specific';

export type HomeGoalStatus =
  | 'notStarted'
  | 'onTrack'
  | 'attention'
  | 'atRisk'
  | 'completed'
  | 'paused'
  | 'abandoned'
  | 'archived';

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

/**
 * `features/missions` doesn't exist yet (`/app/missoes` is a stub — see
 * `docs/goals.md`'s own note on this). Same accepted pattern `goals`
 * already uses for the same gap (`mocks/missionsSourceData.mock.ts`):
 * a small, self-contained projection shaped like the future real data.
 */
export type MissionHomeStatus = 'pending' | 'completed' | 'overdue' | 'waitingFollowUp';

export interface HomeMissionSummary {
  id: string;
  title: string;
  status: MissionHomeStatus;
  dueDate?: string;
  estimatedDurationMinutes?: number;
}

export interface MissionHomeProjection {
  focusToday: HomeMissionSummary | null;
  next: HomeMissionSummary | null;
  pendingCount: number;
  completedCount: number;
  overdue: HomeMissionSummary[];
  waitingFollowUp: HomeMissionSummary[];
}

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

export interface HomeHabitSummary {
  id: string;
  name: string;
  icon: string;
  timeOfDay: HomeTimeOfDay;
  isCompleted: boolean;
  /** `true` only for a simple binary habit — the only case Home's quick-complete can safely log without a quantity/duration UI. */
  canQuickComplete: boolean;
}

export interface HomeRoutineSummary {
  id: string;
  name: string;
  timeOfDay: HomeTimeOfDay;
  preferredTime?: string;
}

export interface HabitHomeProjection {
  scheduledToday: number;
  completedToday: number;
  next: HomeHabitSummary | null;
  currentRoutine: HomeRoutineSummary | null;
  nextRoutine: HomeRoutineSummary | null;
}

// ---------------------------------------------------------------------------
// Training
// ---------------------------------------------------------------------------

export type TrainingHomeStatus = 'planned' | 'completed' | 'skipped' | 'missed' | 'rest';

export interface HomeTrainingSummary {
  id: string;
  label: string;
  date: string;
  time?: string;
  status: TrainingHomeStatus;
  estimatedDurationMinutes?: number;
}

export interface TrainingHomeProjection {
  today: HomeTrainingSummary | null;
  next: HomeTrainingSummary | null;
  hasActiveSession: boolean;
}

// ---------------------------------------------------------------------------
// Nutrition
// ---------------------------------------------------------------------------

export interface HomeMealSummary {
  id: string;
  mealTypeName: string;
  time?: string;
  title?: string;
  prepared: boolean;
}

export interface NutritionHomeProjection {
  nextMeal: HomeMealSummary | null;
  plannedMealsToday: number;
  preparedMealsToday: number;
  pantryUrgentCount: number;
  shoppingPendingCount: number;
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export interface HomeGoalSummary {
  id: string;
  title: string;
  status: HomeGoalStatus;
  progressPercent: number;
  nextMilestoneTitle?: string;
}

export interface GoalHomeProjection {
  inFocus: HomeGoalSummary[];
  atRisk: HomeGoalSummary[];
  pendingCheckIns: number;
}

// ---------------------------------------------------------------------------
// Leisure
// ---------------------------------------------------------------------------

export interface HomeLeisureSummary {
  id: string;
  title: string;
  /** The leisure item's `type` discriminant (e.g. `'movie'`, `'book'`) — kept as `string` rather than importing `LeisureItemType`; see the note above `HomeTimeOfDay`. */
  type: string;
  startTime?: string;
}

export interface LeisureHomeProjection {
  plannedToday: HomeLeisureSummary | null;
  inProgress: HomeLeisureSummary | null;
  backlogCount: number;
}

// ---------------------------------------------------------------------------
// Daily Rhythm (the day's schedule as a whole)
// ---------------------------------------------------------------------------

export interface DailyRhythmHomeProjection {
  currentEntry: ScheduleEntry | null;
  nextEntries: ScheduleEntry[];
  freeSlots: FreeTimeSlot[];
  capacity: DailyCapacity | null;
  conflicts: ScheduleConflict[];
  unscheduledCount: number;
  hasAnyEntry: boolean;
}
