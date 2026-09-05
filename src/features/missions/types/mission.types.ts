import type { MissionRecurrenceRule } from './missionRecurrence.types';

/** Mirrors the area vocabulary already used by `HabitArea`/`GoalArea` — not a shared import, same convention those two features already follow. */
export type MissionArea =
  | 'work'
  | 'routine'
  | 'training'
  | 'nutrition'
  | 'habits'
  | 'leisure'
  | 'personal'
  | 'other';

/**
 * Persisted lifecycle status. `overdue` is intentionally NOT a member — it is always derived from
 * `deadline < now` on a mission that isn't `completed`/`cancelled`/`archived` (see `missionDateStatus.ts`).
 */
export type MissionStatus =
  | 'inbox'
  | 'ready'
  | 'planned'
  | 'inProgress'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'cancelled'
  | 'archived';

/** Temporal urgency. Independent from `MissionImportance` so Eisenhower quadrants aren't collapsed into one axis. */
export type MissionPriority = 'none' | 'low' | 'medium' | 'high' | 'critical';

/** Optional second Eisenhower axis. A mission with no `importance` still works everywhere else — it just can't be placed on the matrix. */
export type MissionImportance = 'low' | 'high';

export type MissionEnergyRequirement = 'low' | 'medium' | 'high';

/**
 * How completion percentage is derived for a mission that has children/steps.
 * `binary` (default): the mission itself is either done or not.
 * `submissions`: percentage comes from child missions (`parentMissionId`).
 * `checklist`: percentage comes from `MissionChecklistItem`s.
 * A future `manualPercentage` is intentionally not modeled yet (spec: "futuro").
 */
export type MissionProgressMode = 'binary' | 'submissions' | 'checklist';

export type MissionSource =
  | 'manual'
  | 'goal'
  | 'leisure'
  | 'recurrence'
  | 'template'
  | 'external';

/** Prepared for future importers (Todoist/CSV/JSON/Microsoft To Do/GitHub/email/Slack) — not implemented now. */
export type MissionImportProvider =
  | 'todoist'
  | 'csv'
  | 'json'
  | 'microsoftToDo'
  | 'github'
  | 'email'
  | 'slack';

/** Keeps re-imports idempotent once a real importer exists — `provider` + `externalId` is the natural key. */
export interface MissionExternalRef {
  provider: MissionImportProvider;
  externalId: string;
  sourceUrl?: string;
  syncMode: 'oneWay' | 'twoWay';
}

export interface Mission {
  id: string;
  title: string;
  description?: string;
  status: MissionStatus;
  priority: MissionPriority;
  /** Second Eisenhower axis — optional, see `MissionImportance`. */
  importance?: MissionImportance;
  projectId?: string;
  sectionId?: string;
  /** Set only for a submission (a child mission with its own identity) — see `docs/missions.md` for submission vs. checklist. */
  parentMissionId?: string;
  areaId?: MissionArea;
  /** Intention: when the user plans to execute. Can move freely without touching `deadline`. */
  plannedDate?: string;
  /**
   * "HH:mm" — set only once Ritmo Diário actually places this mission in a time slot. A mission
   * can have `plannedDate` (intention) without this (no `ScheduleEntry` yet, shows in "Para
   * encaixar"); see spec "MISSÃO SEM HORÁRIO" vs. "MISSÃO COM HORÁRIO".
   */
  scheduledStartAt?: string;
  /** The mission is not relevant/visible in Today/Próximas before this date. */
  availableFrom?: string;
  /** The real limit. Only a passed `deadline` on a non-terminal mission derives `overdue`. */
  deadline?: string;
  /** Minutes. Estimate only — never overwritten by execution data (see `actualDurationMinutes`). */
  estimatedDuration?: number;
  /** Minutes. The ideal chunk size the scheduler should aim for when splitting — distinct from the hard floor `minimumChunkDuration`. */
  preferredDuration?: number;
  /** Cached sum of related `FocusSession`s, recomputed by `missionService` — never hand-edited. */
  actualDurationMinutes?: number;
  splittable?: boolean;
  minimumChunkDuration?: number;
  energyRequirement?: MissionEnergyRequirement;
  contextIds: string[];
  tagIds: string[];
  goalIds: string[];
  scheduleEntryIds: string[];
  recurrenceRule?: MissionRecurrenceRule;
  /** Groups every occurrence of a recurring mission so history is never overwritten (see `docs/missions.md#recorrência`). */
  recurrenceSeriesId?: string;
  /** Free-text reason the mission is blocked on an external party — set alongside `status: 'waiting'`. */
  waitingFor?: string;
  followUpAt?: string;
  reminderIds: string[];
  progressMode: MissionProgressMode;
  source: MissionSource;
  sourceEntityId?: string;
  externalRef?: MissionExternalRef;
  /** How many times this mission's `plannedDate`/`scheduleEntryIds` changed after first being planned — feeds review, never used to judge the user (see spec "NÃO JULGAR"). */
  replanCount: number;
  /** Prepared, not implemented: future collaboration (spec "COLABORAÇÃO FUTURA"). */
  assigneeId?: string;
  sharedProjectId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  archivedAt?: string;
}

/** Everything computed from `Mission` + "now" + related data — never persisted, never trusted from stale reads. */
export interface MissionDerivedFlags {
  overdue: boolean;
  dueToday: boolean;
  availableToday: boolean;
  scheduledToday: boolean;
  followUpDue: boolean;
  blocked: boolean;
  waiting: boolean;
  /** `plannedDate` in the past but mission still open — spec: "Planned past... pode gerar unplanned/needsReview", explicitly not auto-promoted to overdue. */
  needsReview: boolean;
}
