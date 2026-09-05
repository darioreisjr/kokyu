import type {
  MissionArea,
  MissionEnergyRequirement,
  MissionImportance,
  MissionPriority,
  MissionStatus,
} from './mission.types';

export interface MissionDateRangeFilter {
  from?: string;
  to?: string;
}

export interface MissionFilters {
  status?: MissionStatus[];
  projectId?: string[];
  sectionId?: string[];
  areaId?: MissionArea[];
  priority?: MissionPriority[];
  importance?: MissionImportance[];
  tagId?: string[];
  contextId?: string[];
  energyRequirement?: MissionEnergyRequirement[];
  goalId?: string[];
  /** Minutes — "Até 15/30/60 min" presets map onto this, "1h+" is expressed as `durationMin`. */
  durationMax?: number;
  durationMin?: number;
  waiting?: boolean;
  blocked?: boolean;
  recurring?: boolean;
  available?: boolean;
  plannedDateRange?: MissionDateRangeFilter;
  deadlineRange?: MissionDateRangeFilter;
  search?: string;
}

export type MissionSortField =
  | 'manual'
  | 'priority'
  | 'deadline'
  | 'plannedDate'
  | 'availableFrom'
  | 'duration'
  | 'createdAt'
  | 'updatedAt'
  | 'title';

export type MissionSortDirection = 'asc' | 'desc';

export interface MissionSort {
  field: MissionSortField;
  direction: MissionSortDirection;
}

export type MissionGroupField = 'none' | 'project' | 'section' | 'status' | 'priority' | 'area' | 'date';

export type MissionLayout = 'list' | 'board' | 'calendar' | 'eisenhower';

export interface SavedMissionView {
  id: string;
  name: string;
  filters: MissionFilters;
  sorting: MissionSort;
  grouping: MissionGroupField;
  layout: MissionLayout;
  createdAt: string;
  updatedAt: string;
}

/** Built-in smart views ship as filter presets, not `SavedMissionView` rows — they're not user-editable or deletable. */
export type BuiltInSmartViewId =
  | 'today'
  | 'overdue'
  | 'noDate'
  | 'waiting'
  | 'blocked'
  | 'inFocus'
  | 'recentlyCompleted';
