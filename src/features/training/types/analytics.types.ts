import type { MuscleGroup } from './exercise.types';

export interface TrendPoint {
  date: string;
  value: number;
}

export interface MuscleVolumeEntry {
  muscleGroup: MuscleGroup;
  directSets: number;
  totalVolumeKg: number;
}

/** Field names deliberately mirror `features/goals/mocks/trainingSourceData.mock.ts` so the eventual goals-adapter rewire is a one-line change, not a reshape. */
export interface TrainingAnalyticsSummary {
  sessionsCompletedThisYear: number;
  minutesTrainedThisYear: number;
  weeklyFrequency: number;
  currentStreakWeeks: number;
  totalVolumeThisWeekKg: number;
  totalSessions: number;
}

export interface WeeklyConsistencyEntry {
  weekStart: string;
  sessionsCompleted: number;
}

export interface AdherenceSummary {
  plannedCount: number;
  completedCount: number;
  adherencePercent: number;
}
