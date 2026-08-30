/** The area of life a goal belongs to — drives icon, grouping and which automatic sources make sense. */
export type GoalArea =
  'work' | 'routine' | 'training' | 'nutrition' | 'habits' | 'leisure' | 'personal' | 'other';

/**
 * The 6 progress strategies the goal engine supports — not a 1:1 mirror of every example in the
 * spec. "Reduction"/"cumulative"/"percentage" are all `numeric` (direction/unit/target vary);
 * "step-based" and "completion-based" are both `milestone`. See `docs/goals.md`.
 */
export type GoalType = 'numeric' | 'binary' | 'milestone' | 'consistency' | 'average' | 'keyResult';

/** Health states (`notStarted`/`onTrack`/`attention`/`atRisk`) are computed; the rest are explicit lifecycle actions. */
export type GoalStatus =
  | 'notStarted'
  | 'onTrack'
  | 'attention'
  | 'atRisk'
  | 'completed'
  | 'paused'
  | 'abandoned'
  | 'archived';

export type GoalPriority = 'low' | 'medium' | 'high' | 'focus';

/** Generic unit vocabulary — components never hardcode a unit label, they look it up via `constants/goalUnits.ts`. */
export type GoalUnit =
  | 'times'
  | 'books'
  | 'workouts'
  | 'hours'
  | 'minutes'
  | 'days'
  | 'pages'
  | 'recipes'
  | 'missions'
  | 'percentage'
  | 'km'
  | 'units';

export type GoalDirection = 'increase' | 'decrease';

export type GoalProgressMode = 'manual' | 'automatic';

/** Which Kokyu module (existing or future) a goal's automatic progress or a key result can come from. */
export type GoalSourceModule = 'mission' | 'training' | 'nutrition' | 'habit' | 'leisure';

export interface GoalSourceRef {
  module: GoalSourceModule;
  metricId: string;
}

export interface GoalNumericMeasurement {
  type: 'numeric';
  direction: GoalDirection;
  unit: GoalUnit;
  baseline: number;
  currentValue: number;
  targetValue: number;
  /** When true, real values above 100% are kept (e.g. "22/20") instead of being clamped for display. */
  allowOverachievement?: boolean;
}

export interface GoalBinaryMeasurement {
  type: 'binary';
  completed: boolean;
}

/** No own fields — progress is always derived from `Goal.milestones`. */
export interface GoalMilestoneMeasurement {
  type: 'milestone';
}

export interface GoalConsistencyMeasurement {
  type: 'consistency';
  unit: GoalUnit;
  baseline: number;
  currentValue: number;
  targetValue: number;
  /** e.g. 7 for "per week" — display context only, never part of the percent formula itself. */
  periodDays?: number;
  allowOverachievement?: boolean;
}

export interface GoalAverageMeasurement {
  type: 'average';
  unit: GoalUnit;
  targetValue: number;
  /** The window the average is computed over, in days (1 = daily average). */
  periodDays: number;
  /** The rolling average over the trailing `periodDays`, maintained by `goalProgressEngine` whenever a progress entry is added — never recomputed inside a component. */
  currentValue: number;
}

/** No own fields — progress is always derived from `Goal.keyResults`. */
export interface GoalKeyResultMeasurement {
  type: 'keyResult';
}

export type GoalMeasurement =
  | GoalNumericMeasurement
  | GoalBinaryMeasurement
  | GoalMilestoneMeasurement
  | GoalConsistencyMeasurement
  | GoalAverageMeasurement
  | GoalKeyResultMeasurement;

/** A milestone is a meaningful checkpoint, not a task — if it needs sub-actions, those belong in Missões (see `GoalLink`). */
export interface GoalMilestone {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  completed: boolean;
  completedAt?: string;
  order: number;
  /** Equal weight across every milestone when omitted on all of them — see `milestoneProgressStrategy.ts`. */
  weight?: number;
}

export interface GoalKeyResult {
  id: string;
  title: string;
  type: 'numeric' | 'binary';
  baseline: number;
  current: number;
  target: number;
  unit: GoalUnit;
  /** Equal weight when omitted — see `keyResultProgressStrategy.ts`. */
  weight?: number;
  source?: GoalSourceRef;
  status: 'notStarted' | 'inProgress' | 'completed';
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  area: GoalArea;
  type: GoalType;
  /** The status actually shown — equals `systemStatus` unless a lifecycle action (pause/complete/abandon/archive) pins it. */
  status: GoalStatus;
  /** Always the freshly recalculated health status — never overwritten silently by a check-in (see `lastCheckInStatus`). */
  systemStatus: GoalStatus;
  /** The user's own perceived status from their last check-in — shown alongside `systemStatus` when they diverge, never replacing it. */
  lastCheckInStatus?: 'onTrack' | 'attention' | 'atRisk';
  priority: GoalPriority;
  measurement: GoalMeasurement;
  progressMode: GoalProgressMode;
  /** Required when `progressMode === 'automatic'`. */
  source?: GoalSourceRef;
  /** `yyyy-MM-dd`. */
  startDate: string;
  /** `yyyy-MM-dd` — absent means "sem prazo". */
  targetDate?: string;
  milestones?: GoalMilestone[];
  keyResults?: GoalKeyResult[];
  tags: string[];
  /** "Por que isso importa para você?" — shown verbatim in the detail view, never turned into generated copy. */
  motivation?: string;
  /** "Como você saberá que atingiu esta meta?" */
  successCriteria?: string;
  /** One level of hierarchy only — a subgoal's own `parentGoalId` is never followed further. */
  parentGoalId?: string;
  /** When set, this goal's progress is derived from its subgoals instead of its own measurement — user opt-in, never assumed. */
  cascadeFromSubgoals?: boolean;
  colorToken?: string;
  checkInFrequency: 'none' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  lastProgressAt?: string;
  lastCheckInAt?: string;
  isDraft?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
  pausedAt?: string;
}
