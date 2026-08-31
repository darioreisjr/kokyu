import type { HabitArea, HabitDirection, HabitStatus, HabitTimeOfDay, HabitTrackingType } from '../types/habit.types';
import type { HabitFrequencyType } from '../types/schedule.types';

export type HabitQuickFilter =
  | 'all'
  | 'today'
  | 'morning'
  | 'automatic'
  | 'needsAttention'
  | 'paused'
  | 'reduce';

export type HabitSortOption =
  | 'manual'
  | 'name'
  | 'consistency'
  | 'streak'
  | 'recent';

export interface HabitFilterState {
  search: string;
  quickFilter: HabitQuickFilter;
  area: HabitArea | 'all';
  status: HabitStatus | 'all';
  timeOfDay: HabitTimeOfDay | 'all';
  frequency: HabitFrequencyType | 'all';
  trackingType: HabitTrackingType | 'all';
  direction: HabitDirection | 'all';
  source: 'all' | 'manual' | 'automatic';
  sortBy: HabitSortOption;
}

export const defaultHabitFilterState: HabitFilterState = {
  search: '',
  quickFilter: 'all',
  area: 'all',
  status: 'all',
  timeOfDay: 'all',
  frequency: 'all',
  trackingType: 'all',
  direction: 'all',
  source: 'all',
  sortBy: 'manual',
};
