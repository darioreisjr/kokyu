'use client';

import { useEffect, useState } from 'react';

import { leisureItemService } from '../services/leisureItemService';
import type { LeisureItem } from '../types/leisureItem.types';

export type LeisureItemLoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

export interface UseLeisureItemResult {
  status: LeisureItemLoadStatus;
  item: LeisureItem | null;
}

/** A single item by id — the edit page's own fetch. */
export function useLeisureItem(id: string): UseLeisureItemResult {
  const [status, setStatus] = useState<LeisureItemLoadStatus>('loading');
  const [item, setItem] = useState<LeisureItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    leisureItemService
      .getLeisureItem(id)
      .then((loadedItem) => {
        if (cancelled) return;
        setItem(loadedItem);
        setStatus(loadedItem ? 'ready' : 'not-found');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { status, item };
}
