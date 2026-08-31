'use client';

import { useCallback, useEffect, useState } from 'react';
import { calculateHabitConsistencyScore } from '../services/engines/habitConsistencyEngine';
import { deriveHabitOccurrence } from '../services/engines/habitOccurrenceService';
import { calculateHabitPeriodProgress, type HabitPeriodProgress } from '../services/engines/habitProgressEngine';
import { calculateHabitStreak } from '../services/engines/habitStreakEngine';
import { habitService } from '../services/habitService';
import type { HabitConsistencyScore, HabitStreak } from '../types/analytics.types';
import type { Habit } from '../types/habit.types';
import type { HabitLog } from '../types/log.types';
import type { HabitOccurrence } from '../types/occurrence.types';

export function useHabit(habitId: string) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [streak, setStreak] = useState<HabitStreak | null>(null);
  const [consistency, setConsistency] = useState<HabitConsistencyScore | null>(null);
  const [periodProgress, setPeriodProgress] = useState<HabitPeriodProgress | null>(null);
  const [todayOccurrence, setTodayOccurrence] = useState<HabitOccurrence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().split('T')[0]!;

    Promise.all([habitService.getHabit(habitId), habitService.getHabitLogs(habitId)]).then(
      ([h, l]) => {
        if (!cancelled && h) {
          setHabit(h);
          setLogs(l);
          setStreak(calculateHabitStreak(h, l, today));
          setConsistency(calculateHabitConsistencyScore(h, l, today, 30));
          setPeriodProgress(calculateHabitPeriodProgress(h, today, l, today));
          setTodayOccurrence(deriveHabitOccurrence(h, today, l, today));
          setIsLoading(false);
        } else if (!cancelled) {
          setIsLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [habitId, reloadKey]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return {
    habit,
    logs,
    streak,
    consistency,
    periodProgress,
    todayOccurrence,
    isLoading,
    refresh,
  };
}
