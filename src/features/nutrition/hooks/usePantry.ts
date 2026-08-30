'use client';

import { useCallback, useEffect, useState } from 'react';

import { ingredientService } from '../services/ingredientService';
import { pantryService } from '../services/pantryService';
import type { Ingredient } from '../types/ingredient.types';
import type { PantryItem, StorageLocation } from '../types/pantry.types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UsePantryResult {
  status: LoadStatus;
  items: PantryItem[];
  ingredients: Ingredient[];
  storageLocations: StorageLocation[];
  reload: () => void;
}

export function usePantry(): UsePantryResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [items, setItems] = useState<PantryItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([
      pantryService.getPantry(),
      ingredientService.getIngredients(),
      pantryService.getStorageLocations(),
    ])
      .then(([loadedItems, loadedIngredients, loadedLocations]) => {
        if (cancelled) return;
        setItems(loadedItems);
        setIngredients(loadedIngredients);
        setStorageLocations(loadedLocations);
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

  return { status, items, ingredients, storageLocations, reload };
}
