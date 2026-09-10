'use client';

import { useCallback, useEffect, useState } from 'react';

import { leisurePlanService } from '../services/leisurePlanService';
import type { LeisurePlanEntry } from '../types/leisurePlan.types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UsePlanEntryResult {
  status: LoadStatus;
  entry: LeisurePlanEntry | null;
  reload: () => void;
}

/** A single plan entry by id — the edit page's own fetch, independent of whatever range the planner list happened to have loaded. */
export function usePlanEntry(id: string): UsePlanEntryResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [entry, setEntry] = useState<LeisurePlanEntry | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    leisurePlanService
      .getPlanEntry(id)
      .then((loadedEntry) => {
        if (cancelled) return;
        setEntry(loadedEntry);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, entry, reload };
}
