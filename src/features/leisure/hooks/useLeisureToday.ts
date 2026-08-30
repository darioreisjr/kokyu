'use client';

import { useCallback, useEffect, useState } from 'react';

import { leisureItemService } from '../services/leisureItemService';
import { leisurePlanService } from '../services/leisurePlanService';
import type { LeisureItem } from '../types/leisureItem.types';
import type { LeisurePlanEntry } from '../types/leisurePlan.types';
import { toDateKey } from '../utils/dateHelpers';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseLeisureTodayResult {
  status: LoadStatus;
  planEntries: LeisurePlanEntry[];
  inProgressItems: LeisureItem[];
  laterItems: LeisureItem[];
  allItems: LeisureItem[];
  reload: () => void;
}

/** Everything "Hoje" needs — today's plan, what's in progress, and a small "Para depois" preview — loaded together so the page never assembles it from three separate hooks. */
export function useLeisureToday(date: Date): UseLeisureTodayResult {
  const dateKey = toDateKey(date);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [planEntries, setPlanEntries] = useState<LeisurePlanEntry[]>([]);
  const [allItems, setAllItems] = useState<LeisureItem[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([
      leisurePlanService.getPlanEntriesForDate(dateKey),
      leisureItemService.getLeisureItems(),
    ])
      .then(([loadedEntries, loadedItems]) => {
        if (cancelled) return;
        setPlanEntries(loadedEntries);
        setAllItems(loadedItems);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [dateKey, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const inProgressItems = allItems.filter((item) => item.status === 'inProgress');
  const laterItems = allItems.filter((item) => item.type === 'unsorted');

  return { status, planEntries, inProgressItems, laterItems, allItems, reload };
}
