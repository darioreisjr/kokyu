import type { Habit, HabitArea, HabitTimeOfDay } from './habit.types';

export interface HabitStreak {
  currentStreak: number;
  bestStreak: number;
  periodUnit: 'days' | 'weeks' | 'months';
  lastCompletedDate?: string;
}

export interface HabitConsistencyScore {
  score: number; // 0-100 weighted consistency score
  rollingDays: number;
  completionRate: number; // raw percentage
  scheduledCount: number;
  completedCount: number;
  partialCount: number;
  skippedCount: number;
}

export interface DailyHabitScore {
  date: string; // "yyyy-MM-dd"
  scheduledCount: number;
  completedCount: number;
  partialCount: number;
  skippedCount: number;
  scorePercent: number; // 0-100 based only on scheduled items
}

export interface WeeklyRhythmDay {
  weekday: number; // 0-6 (Sun-Sat)
  label: string;   // "Seg", "Ter", etc.
  completionRate: number; // 0-100%
  totalScheduled: number;
  totalCompleted: number;
}

export interface TimeOfDayPattern {
  habitId?: string;
  timeOfDay: HabitTimeOfDay;
  preferredHourRange?: string; // "19h às 21h"
  confidence: 'low' | 'medium' | 'high';
  sampleSize: number;
  description: string;
}

export interface AreaDistribution {
  area: HabitArea;
  label: string;
  count: number;
  percentage: number;
}

export interface HabitTrend {
  period: string; // "Últimos 30 dias"
  currentRate: number;
  previousRate: number;
  changePoints: number; // current - previous
  trend: 'up' | 'down' | 'stable';
}

export interface HabitsOverviewAnalytics {
  overallConsistency: number;
  activeHabitsCount: number;
  totalExecutionsInPeriod: number;
  completedRoutinesCount: number;
  habitsOnTrackCount: number;
  habitsNeedingAttentionCount: number;
  dailyScores: DailyHabitScore[];
  weeklyRhythm: WeeklyRhythmDay[];
  areaDistribution: AreaDistribution[];
  timePatterns: TimeOfDayPattern[];
  trend: HabitTrend;
  habitsNeedingAttention: {
    habit: Habit;
    consistencyScore: number;
    recentMisses: number;
  }[];
}

