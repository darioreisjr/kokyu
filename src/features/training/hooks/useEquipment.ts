'use client';

import { useEffect, useState } from 'react';

import { equipmentService } from '../services/equipmentService';
import type { Equipment } from '../types';
import type { LoadStatus } from './useExercises';

export interface UseEquipmentResult {
  status: LoadStatus;
  equipment: Equipment[];
}

export function useEquipment(): UseEquipmentResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    let cancelled = false;
    equipmentService
      .getEquipment()
      .then((loaded) => {
        if (cancelled) return;
        setEquipment(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, equipment };
}
