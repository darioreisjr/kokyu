'use client';

import { useCallback, useEffect, useState } from 'react';

import { programService } from '../services/programService';
import type { TrainingProgram } from '../types';
import type { LoadStatus } from './usePrograms';

export interface UseProgramResult {
  status: LoadStatus;
  program: TrainingProgram | null;
  reload: () => void;
}

export function useProgram(id: string): UseProgramResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    programService
      .getProgram(id)
      .then((loaded) => {
        if (cancelled) return;
        setProgram(loaded);
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

  return { status, program, reload };
}
