import type { MissionArea } from './mission.types';

export type MissionProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

/**
 * Only `completionRatio` is implemented (`completed eligible / eligible`, ignoring
 * cancelled/archived). `manual`/`weighted`/`milestone` are prepared union members for later —
 * spec explicitly says not to overengineer this now.
 */
export type MissionProjectProgressStrategyType = 'completionRatio' | 'manual' | 'weighted' | 'milestone';

export type MissionProjectView = 'list' | 'board' | 'calendar';

export interface MissionProject {
  id: string;
  name: string;
  description?: string;
  status: MissionProjectStatus;
  areaId?: MissionArea;
  /** Reuses the existing Goal↔module contribution pattern (`GoalLink`) — a project never duplicates goal data. */
  goalIds: string[];
  startDate?: string;
  targetDate?: string;
  colorToken?: string;
  icon?: string;
  progressStrategy: MissionProjectProgressStrategyType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
}

/** Custom Kanban columns for one project — sections are per-project, never a second global status enum (spec "CUSTOM WORKFLOW"). */
export interface MissionSection {
  id: string;
  projectId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MissionProjectProgress {
  completedCount: number;
  eligibleCount: number;
  percent: number;
}
