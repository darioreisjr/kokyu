import type { Goal, GoalArea, GoalPriority, GoalStatus, GoalType } from '../types';
import { fromDateKey } from './dateHelpers';

export type GoalQuickFilter = 'focus' | 'onTrack' | 'attention' | 'atRisk' | 'noUpdate' | 'dueSoon';

export interface GoalFilterOptions {
  search?: string;
  area?: GoalArea;
  status?: GoalStatus;
  priority?: GoalPriority;
  type?: GoalType;
  source?: 'manual' | 'automatic';
  tag?: string;
  quickFilter?: GoalQuickFilter;
}

export type GoalSortOption = 'priority' | 'progress' | 'deadline' | 'updated' | 'risk' | 'title';

const STALE_DAYS_THRESHOLD = 14;
const DUE_SOON_DAYS_THRESHOLD = 14;
const INACTIVE_STATUSES: GoalStatus[] = ['completed', 'abandoned', 'archived', 'paused'];

// Unicode's "combining diacritical marks" block — stripping it after NFD normalization is what
// turns "é"/"ã" into their plain-letter equivalents for accent-insensitive search.
const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;

function normalize(value: string): string {
  return Array.from(value.normalize('NFD'))
    .filter((char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      return codePoint < COMBINING_DIACRITICS_START || codePoint > COMBINING_DIACRITICS_END;
    })
    .join('')
    .toLowerCase();
}

/** A manual goal that hasn't moved (progress or check-in) in a while — centralized so no page invents its own threshold. */
export function isGoalStale(goal: Goal, now: Date = new Date()): boolean {
  if (goal.progressMode === 'automatic') return false;
  if (INACTIVE_STATUSES.includes(goal.status)) return false;
  const lastActivityDate = new Date(goal.lastProgressAt ?? goal.lastCheckInAt ?? goal.createdAt);
  const days = Math.floor((now.getTime() - lastActivityDate.getTime()) / (24 * 60 * 60 * 1000));
  return days >= STALE_DAYS_THRESHOLD;
}

export function isGoalDueSoon(goal: Goal, now: Date = new Date()): boolean {
  if (!goal.targetDate || INACTIVE_STATUSES.includes(goal.status)) return false;
  const days = Math.floor(
    (fromDateKey(goal.targetDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
  );
  return days >= 0 && days <= DUE_SOON_DAYS_THRESHOLD;
}

/** Pure and synchronous — search/area/status/priority/type/source/tag/quick-filter all read fields already on `Goal`, none need the async progress engine. */
export function filterGoals(
  goals: Goal[],
  options: GoalFilterOptions,
  now: Date = new Date(),
): Goal[] {
  const normalizedQuery = options.search ? normalize(options.search) : '';

  return goals.filter((goal) => {
    if (normalizedQuery) {
      const matchesTitle = normalize(goal.title).includes(normalizedQuery);
      const matchesTag = goal.tags.some((tag) => normalize(tag).includes(normalizedQuery));
      const matchesMilestone = (goal.milestones ?? []).some((milestone) =>
        normalize(milestone.title).includes(normalizedQuery),
      );
      const matchesKeyResult = (goal.keyResults ?? []).some((keyResult) =>
        normalize(keyResult.title).includes(normalizedQuery),
      );
      if (!matchesTitle && !matchesTag && !matchesMilestone && !matchesKeyResult) return false;
    }
    if (options.area && goal.area !== options.area) return false;
    if (options.status && goal.status !== options.status) return false;
    if (options.priority && goal.priority !== options.priority) return false;
    if (options.type && goal.type !== options.type) return false;
    if (options.source && goal.progressMode !== options.source) return false;
    if (options.tag && !goal.tags.includes(options.tag)) return false;

    if (options.quickFilter === 'focus' && goal.priority !== 'focus') return false;
    if (options.quickFilter === 'onTrack' && goal.status !== 'onTrack') return false;
    if (options.quickFilter === 'attention' && goal.status !== 'attention') return false;
    if (options.quickFilter === 'atRisk' && goal.status !== 'atRisk') return false;
    if (options.quickFilter === 'noUpdate' && !isGoalStale(goal, now)) return false;
    if (options.quickFilter === 'dueSoon' && !isGoalDueSoon(goal, now)) return false;

    return true;
  });
}

const PRIORITY_RANK: Record<GoalPriority, number> = { focus: 0, high: 1, medium: 2, low: 3 };
const RISK_RANK: Record<GoalStatus, number> = {
  atRisk: 0,
  attention: 1,
  notStarted: 2,
  onTrack: 3,
  paused: 4,
  completed: 5,
  abandoned: 6,
  archived: 7,
};

/** `progressByGoalId` is optional because progress is computed async (see `GoalProgressEngine`) — a caller that hasn't resolved it yet just sorts those goals as 0%. */
export function sortGoals(
  goals: Goal[],
  sortBy: GoalSortOption,
  progressByGoalId: Record<string, number> = {},
): Goal[] {
  const sorted = [...goals];
  switch (sortBy) {
    case 'priority':
      return sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    case 'progress':
      return sorted.sort((a, b) => (progressByGoalId[b.id] ?? 0) - (progressByGoalId[a.id] ?? 0));
    case 'deadline':
      return sorted.sort((a, b) =>
        (a.targetDate ?? '9999-12-31').localeCompare(b.targetDate ?? '9999-12-31'),
      );
    case 'updated':
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case 'risk':
      return sorted.sort((a, b) => RISK_RANK[a.status] - RISK_RANK[b.status]);
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    default:
      return sorted;
  }
}
