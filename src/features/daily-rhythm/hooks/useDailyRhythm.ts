'use client';

import { addDays, format, subDays } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fromDateKey } from '@/features/leisure/utils/dateHelpers';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { dailyRhythmService, type DayScheduleResult } from '../services/dailyRhythmService';

export function useDailyRhythm(initialDate?: string) {
  const { preferences } = usePreferences();
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate ?? format(new Date(), 'yyyy-MM-dd'),
  );
  const [scheduleData, setScheduleData] = useState<DayScheduleResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dailyRhythmService.getDaySchedule(selectedDate, {
        dayStartsAt: preferences.routine.dayStartsAt,
        dayEndsAt: preferences.routine.dayEndsAt,
        sourceFilter: sourceFilter.length > 0 ? sourceFilter : undefined,
      });
      setScheduleData(data);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, preferences.routine.dayStartsAt, preferences.routine.dayEndsAt, sourceFilter]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const goToToday = useCallback(() => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((prev) => format(subDays(fromDateKey(prev), 1), 'yyyy-MM-dd'));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => format(addDays(fromDateKey(prev), 1), 'yyyy-MM-dd'));
  }, []);

  // Filter entries by search query (memoized to prevent re-render cascades)
  const filteredEntries = useMemo(() => {
    const list = scheduleData?.entries ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)),
    );
  }, [scheduleData?.entries, searchQuery]);

  const filteredUnscheduled = useMemo(() => {
    const list = scheduleData?.unscheduled ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)),
    );
  }, [scheduleData?.unscheduled, searchQuery]);

  const freeSlots = useMemo(() => scheduleData?.freeSlots ?? [], [scheduleData?.freeSlots]);
  const conflicts = useMemo(() => scheduleData?.conflicts ?? [], [scheduleData?.conflicts]);

  return {
    selectedDate,
    setSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    entries: filteredEntries,
    unscheduled: filteredUnscheduled,
    freeSlots,
    capacity: scheduleData?.capacity ?? null,
    conflicts,
    isLoading,
    sourceFilter,
    setSourceFilter,
    searchQuery,
    setSearchQuery,
    refreshSchedule: loadSchedule,
  };
}
