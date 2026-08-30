'use client';

import { useCallback, useEffect, useState } from 'react';

import { trainingPreferencesService } from '../services/trainingPreferencesService';
import type { TrainingPreferences } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseTrainingPreferencesResult {
  status: LoadStatus;
  preferences: TrainingPreferences | null;
  updatePreferences: (patch: Partial<TrainingPreferences>) => Promise<void>;
}

export function useTrainingPreferences(): UseTrainingPreferencesResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [preferences, setPreferences] = useState<TrainingPreferences | null>(null);

  useEffect(() => {
    let cancelled = false;
    trainingPreferencesService
      .getPreferences()
      .then((loaded) => {
        if (cancelled) return;
        setPreferences(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePreferences = useCallback(async (patch: Partial<TrainingPreferences>) => {
    const updated = await trainingPreferencesService.updatePreferences(patch);
    setPreferences(updated);
  }, []);

  return { status, preferences, updatePreferences };
}
