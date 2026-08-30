'use client';

import { useCallback, useEffect, useState } from 'react';

import { recoveryEstimateService } from '../services/recoveryEstimateService';
import type { MuscleRecoveryEstimate } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseRecoveryOverviewResult {
  status: LoadStatus;
  estimates: MuscleRecoveryEstimate[];
  reload: () => void;
}

export function useRecoveryOverview(): UseRecoveryOverviewResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [estimates, setEstimates] = useState<MuscleRecoveryEstimate[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    recoveryEstimateService
      .getRecoveryOverview()
      .then((loaded) => {
        if (cancelled) return;
        setEstimates(loaded);
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

  return { status, estimates, reload };
}
