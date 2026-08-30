'use client';

import { useCallback, useEffect, useState } from 'react';

import { collectionService } from '../services/collectionService';
import type { LeisureCollection } from '../types/collection.types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseCollectionsResult {
  status: LoadStatus;
  collections: LeisureCollection[];
  reload: () => void;
}

export function useCollections(): UseCollectionsResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [collections, setCollections] = useState<LeisureCollection[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    collectionService
      .getCollections()
      .then((loaded) => {
        if (cancelled) return;
        setCollections(loaded);
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

  return { status, collections, reload };
}
