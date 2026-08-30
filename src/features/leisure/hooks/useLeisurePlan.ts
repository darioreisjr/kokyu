'use client';

import { useCallback, useEffect, useState } from 'react';

import { leisureItemService } from '../services/leisureItemService';
import { leisurePlanService } from '../services/leisurePlanService';
import type { LeisureItem } from '../types/leisureItem.types';
import type { LeisurePlanEntry } from '../types/leisurePlan.types';
import { toDateKey } from '../utils/dateHelpers';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseLeisurePlanResult {
  status: LoadStatus;
  planEntries: LeisurePlanEntry[];
  items: LeisureItem[];
  reload: () => void;
}

/** Loads every plan entry across `weekDays` (Monday–Sunday, or whatever it covers) plus every item, so a week view can resolve each entry's item without a second round trip. */
export function useLeisurePlan(weekDays: Date[]): UseLeisurePlanResult {
  const startKey = weekDays[0] ? toDateKey(weekDays[0]) : '';
  const endKey = weekDays[weekDays.length - 1] ? toDateKey(weekDays[weekDays.length - 1]!) : '';

  const [status, setStatus] = useState<LoadStatus>('loading');
  const [planEntries, setPlanEntries] = useState<LeisurePlanEntry[]>([]);
  const [items, setItems] = useState<LeisureItem[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!startKey || !endKey) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([
      leisurePlanService.getLeisurePlan(startKey, endKey),
      leisureItemService.getLeisureItems(),
    ])
      .then(([loadedEntries, loadedItems]) => {
        if (cancelled) return;
        setPlanEntries(loadedEntries);
        setItems(loadedItems);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [startKey, endKey, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, planEntries, items, reload };
}
