'use client';

import { useCallback, useEffect, useState } from 'react';

import { historyService } from '../services/historyService';
import { leisureItemService } from '../services/leisureItemService';
import type { LeisureItem } from '../types/leisureItem.types';
import type { LeisureLogEntry } from '../types/leisureLog.types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseHistoryResult {
  status: LoadStatus;
  logEntries: LeisureLogEntry[];
  items: LeisureItem[];
  reload: () => void;
}

export function useHistory(): UseHistoryResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [logEntries, setLogEntries] = useState<LeisureLogEntry[]>([]);
  const [items, setItems] = useState<LeisureItem[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([historyService.getHistory(), leisureItemService.getLeisureItems()])
      .then(([loadedLog, loadedItems]) => {
        if (cancelled) return;
        setLogEntries(loadedLog);
        setItems(loadedItems);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, logEntries, items, reload };
}
