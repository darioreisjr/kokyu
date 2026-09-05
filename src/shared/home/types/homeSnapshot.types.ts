import type { FreeTimeSlot, ScheduleEntry } from '@/shared/scheduling/types';
import type { HomeAttentionItem } from './homeAttention.types';
import type {
  DailyRhythmHomeProjection,
  GoalHomeProjection,
  HabitHomeProjection,
  LeisureHomeProjection,
  MissionHomeProjection,
  NutritionHomeProjection,
  TrainingHomeProjection,
} from './homeProjections.types';
import type { HomeProviderResult } from './homeProvider.types';

/**
 * Position in the logical day — never a productivity score, just a fact
 * ("Agora 14:30", "4 de 7 atividades planejadas"). See spec's "NÃO CRIAR
 * SCORE DE PRODUTIVIDADE".
 */
export interface HomeDayProgress {
  totalMinutes: number;
  elapsedMinutes: number;
  percent: number;
}

export type HomePriorityItem =
  | {
      kind: 'mission';
      id: string;
      title: string;
      status: 'pending' | 'completed' | 'overdue' | 'waitingFollowUp';
      actionHref: string;
    }
  | {
      kind: 'goal';
      id: string;
      title: string;
      progressPercent: number;
      nextStepLabel?: string;
      actionHref: string;
    };

export interface HomeQuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
}

/**
 * `HomeSnapshot` — the one thing Respiração renders from. Never entities,
 * only small projections + what `HomeSnapshotService` derives from them
 * (day progress, merged priorities, ordered attention). See
 * `docs/respiration-home.md`.
 */
export interface HomeSnapshot {
  date: string;
  now: string;
  dayProgress: HomeDayProgress;
  currentEntry: ScheduleEntry | null;
  currentFreeSlot: FreeTimeSlot | null;
  nextEntries: ScheduleEntry[];
  dailyPriorities: HomePriorityItem[];
  missions: HomeProviderResult<MissionHomeProjection>;
  habits: HomeProviderResult<HabitHomeProjection>;
  training: HomeProviderResult<TrainingHomeProjection>;
  nutrition: HomeProviderResult<NutritionHomeProjection>;
  goals: HomeProviderResult<GoalHomeProjection>;
  leisure: HomeProviderResult<LeisureHomeProjection>;
  schedule: HomeProviderResult<DailyRhythmHomeProjection>;
  alerts: HomeAttentionItem[];
  quickActions: HomeQuickAction[];
  /** Drives the compact onboarding empty state for a brand-new user — see spec's "EMPTY HOME". */
  hasAnyPlannedActivity: boolean;
  generatedAt: string;
}
