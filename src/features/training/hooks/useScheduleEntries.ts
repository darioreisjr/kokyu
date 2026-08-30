'use client';

import { useCallback, useEffect, useState } from 'react';

import type { DateRange } from '../services/trainingScheduleService';
import { trainingScheduleService } from '../services/trainingScheduleService';
import type { TrainingScheduleEntry } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseScheduleEntriesResult {
  status: LoadStatus;
  entries: TrainingScheduleEntry[];
  reload: () => void;
}

export function useScheduleEntries(range?: DateRange): UseScheduleEntriesResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [entries, setEntries] = useState<TrainingScheduleEntry[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    trainingScheduleService
      .getTrainingCalendar(range)
      .then((loaded) => {
        if (cancelled) return;
        setEntries(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range?.from, range?.to, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, entries, reload };
}
