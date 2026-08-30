'use client';

import { useCallback, useEffect, useState } from 'react';

import { leisureItemService } from '../services/leisureItemService';
import type { LeisureItem } from '../types/leisureItem.types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseLeisureItemsResult {
  status: LoadStatus;
  items: LeisureItem[];
  reload: () => void;
}

/** Every item, unfiltered — Para depois/Biblioteca/Lugares/Hobbies each filter this same list client-side by `type`/`status` rather than four separate loaders duplicating the same fetch. */
export function useLeisureItems(): UseLeisureItemsResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [items, setItems] = useState<LeisureItem[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    leisureItemService
      .getLeisureItems()
      .then((loadedItems) => {
        if (cancelled) return;
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

  return { status, items, reload };
}
