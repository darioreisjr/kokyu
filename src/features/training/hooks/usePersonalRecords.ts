'use client';

import { useCallback, useEffect, useState } from 'react';

import { personalRecordService } from '../services/personalRecordService';
import type { PersonalRecord } from '../types';
import type { LoadStatus } from './useExercises';

export interface UsePersonalRecordsResult {
  status: LoadStatus;
  records: PersonalRecord[];
  reload: () => void;
}

export function usePersonalRecords(exerciseId?: string): UsePersonalRecordsResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    personalRecordService
      .getPersonalRecords(exerciseId)
      .then((loaded) => {
        if (cancelled) return;
        setRecords(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, records, reload };
}
