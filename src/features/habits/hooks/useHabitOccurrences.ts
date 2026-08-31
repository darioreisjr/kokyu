'use client';

import { useCallback, useEffect, useState } from 'react';
import { deriveHabitOccurrencesForDateRange } from '../services/engines/habitOccurrenceService';
import { habitService } from '../services/habitService';
import type { Habit } from '../types/habit.types';
import type { HabitOccurrence } from '../types/occurrence.types';

export function useHabitOccurrences(
  habitId: string,
  startDate: string,
  endDate: string,
) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [occurrences, setOccurrences] = useState<HabitOccurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const today = new Date().toISOString().split('T')[0]!;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      habitService.getHabit(habitId),
      habitService.getHabitLogs(habitId),
    ]).then(([h, logs]) => {
      if (!cancelled && h) {
        setHabit(h);
        setOccurrences(
          deriveHabitOccurrencesForDateRange(h, startDate, endDate, logs, today),
        );
        setIsLoading(false);
      } else if (!cancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [habitId, startDate, endDate, today, reloadKey]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return { habit, occurrences, isLoading, refresh };
}
