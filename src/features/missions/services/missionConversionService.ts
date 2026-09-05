import type { Mission, MissionArea } from '../types';

/**
 * Plain-data draft for "Transformar em hábito" (spec) — deliberately not typed against the Habits
 * feature's own `Habit`/`HabitInput` so `missions` never imports `features/habits` types
 * directly; the Habits creation form maps this DTO onto its own default values.
 */
export interface HabitDraftFromMission {
  name: string;
  area: MissionArea;
  description?: string;
  estimatedDurationMinutes?: number;
  tagIds: string[];
  sourceMissionId: string;
}

export function buildHabitDraftFromMission(mission: Mission): HabitDraftFromMission {
  return {
    name: mission.title,
    area: mission.areaId ?? 'other',
    description: mission.description,
    estimatedDurationMinutes: mission.estimatedDuration,
    tagIds: [...mission.tagIds],
    sourceMissionId: mission.id,
  };
}

/** What to do with the original mission after conversion — the caller always asks, never decides silently (spec "NÃO DELETAR MISSION AUTOMATICAMENTE"). */
export type PostConversionAction = 'complete' | 'archive' | 'keep';
