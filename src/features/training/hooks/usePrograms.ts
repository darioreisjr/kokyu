'use client';

import { useCallback, useEffect, useState } from 'react';

import { programService } from '../services/programService';
import type { TrainingProgram } from '../types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseProgramsResult {
  status: LoadStatus;
  programs: TrainingProgram[];
  reload: () => void;
}

export function usePrograms(): UseProgramsResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    programService
      .getPrograms()
      .then((loaded) => {
        if (cancelled) return;
        setPrograms(loaded);
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

  return { status, programs, reload };
}
