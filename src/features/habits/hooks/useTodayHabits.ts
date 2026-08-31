'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { calculateDailyHabitScore } from '../services/engines/habitProgressEngine';
import { habitService } from '../services/habitService';
import type { DailyHabitScore } from '../types/analytics.types';
import type { HabitLogContext } from '../types/log.types';
import type { HabitOccurrence } from '../types/occurrence.types';

export function useTodayHabits() {
  const [occurrences, setOccurrences] = useState<HabitOccurrence[]>([]);
  const [dailyScore, setDailyScore] = useState<DailyHabitScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActionLogId, setLastActionLogId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const today = new Date().toISOString().split('T')[0]!;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      habitService.getHabitOccurrences(today),
      habitService.getHabits(),
      habitService.getHabitLogs(),
    ]).then(([occs, habits, logs]) => {
      if (!cancelled) {
        setOccurrences(occs);
        setDailyScore(calculateDailyHabitScore(habits, today, logs, today));
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [today, reloadKey]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  const quickComplete = useCallback(
    async (habitId: string, loggedValue?: number) => {
      const habit = occurrences.find((o) => o.habitId === habitId)?.habit;
      const targetVal =
        loggedValue !== undefined
          ? loggedValue
          : (habit && 'targetValue' in habit.target && habit.target.targetValue) || 1;

      const log = await habitService.createHabitLog({
        habitId,
        date: today,
        timestamp: new Date().toISOString(),
        status: 'completed',
        value: targetVal,
        source: 'manual',
      });

      setLastActionLogId(log.id);
      await refresh();
    },
    [occurrences, today, refresh],
  );

  const quickIncrement = useCallback(
    async (habitId: string, delta: number) => {
      const current = occurrences.find((o) => o.habitId === habitId);
      const currentVal = current?.loggedValue ?? 0;
      const newVal = currentVal + delta;

      const log = await habitService.createHabitLog({
        habitId,
        date: today,
        timestamp: new Date().toISOString(),
        status: 'completed',
        value: newVal,
        source: 'manual',
      });

      setLastActionLogId(log.id);
      await refresh();
    },
    [occurrences, today, refresh],
  );

  const skipOccurrence = useCallback(
    async (habitId: string, note?: string) => {
      const log = await habitService.skipHabitOccurrence(habitId, today, note);
      setLastActionLogId(log.id);
      await refresh();
    },
    [today, refresh],
  );

  const addNote = useCallback(
    async (habitId: string, note: string, context?: HabitLogContext) => {
      const current = occurrences.find((o) => o.habitId === habitId);
      const currentVal = current?.loggedValue ?? 1;

      const log = await habitService.createHabitLog({
        habitId,
        date: today,
        timestamp: new Date().toISOString(),
        status: current?.status === 'completed' ? 'completed' : 'partial',
        value: currentVal,
        note,
        context,
        source: 'manual',
      });

      setLastActionLogId(log.id);
      await refresh();
    },
    [occurrences, today, refresh],
  );

  const undoLastAction = useCallback(async () => {
    if (lastActionLogId) {
      await habitService.deleteHabitLog(lastActionLogId);
      setLastActionLogId(null);
      await refresh();
    }
  }, [lastActionLogId, refresh]);

  const grouped = useMemo(() => {
    const morning: HabitOccurrence[] = [];
    const afternoon: HabitOccurrence[] = [];
    const evening: HabitOccurrence[] = [];
    const anytime: HabitOccurrence[] = [];

    occurrences.forEach((occ) => {
      if (occ.isScheduled || occ.loggedValue > 0) {
        if (occ.habit.timeOfDay === 'morning') morning.push(occ);
        else if (occ.habit.timeOfDay === 'afternoon') afternoon.push(occ);
        else if (occ.habit.timeOfDay === 'evening') evening.push(occ);
        else anytime.push(occ);
      }
    });

    return { morning, afternoon, evening, anytime };
  }, [occurrences]);

  return {
    occurrences,
    grouped,
    dailyScore,
    isLoading,
    quickComplete,
    quickIncrement,
    skipOccurrence,
    addNote,
    undoLastAction,
    canUndo: Boolean(lastActionLogId),
    refresh,
  };
}
