'use client';

import { useEffect, useState } from 'react';

import { trainingLocationService } from '../services/trainingLocationService';
import type { TrainingLocation } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseTrainingLocationsResult {
  status: LoadStatus;
  locations: TrainingLocation[];
}

export function useTrainingLocations(): UseTrainingLocationsResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [locations, setLocations] = useState<TrainingLocation[]>([]);

  useEffect(() => {
    let cancelled = false;
    trainingLocationService
      .getLocations()
      .then((loaded) => {
        if (cancelled) return;
        setLocations(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, locations };
}
