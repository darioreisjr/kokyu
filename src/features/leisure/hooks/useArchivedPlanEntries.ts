'use client';

import { useCallback, useEffect, useState } from 'react';

import { leisurePlanService } from '../services/leisurePlanService';
import type { LeisurePlanEntry } from '../types/leisurePlan.types';
import type { LoadStatus } from './useLeisurePlan';

export interface UseArchivedPlanEntriesResult {
  status: LoadStatus;
  archivedEntries: LeisurePlanEntry[];
  reload: () => void;
}

/** Every archived plan entry for the current user — flat, no date range, no recurrence expansion (see `leisurePlanService.getArchivedPlanEntries`). */
export function useArchivedPlanEntries(active: boolean): UseArchivedPlanEntriesResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [archivedEntries, setArchivedEntries] = useState<LeisurePlanEntry[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    leisurePlanService
      .getArchivedPlanEntries()
      .then((entries) => {
        if (cancelled) return;
        setArchivedEntries(entries);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [active, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, archivedEntries, reload };
}
