'use client';

import { useCallback, useEffect, useState } from 'react';

import { ingredientService } from '../services/ingredientService';
import { pantryService } from '../services/pantryService';
import { shoppingService } from '../services/shoppingService';
import type { Ingredient } from '../types/ingredient.types';
import type { StorageLocation } from '../types/pantry.types';
import type { ShoppingItem } from '../types/shopping.types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseShoppingListResult {
  status: LoadStatus;
  items: ShoppingItem[];
  ingredients: Ingredient[];
  storageLocations: StorageLocation[];
  reload: () => void;
}

export function useShoppingList(): UseShoppingListResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([
      shoppingService.getShoppingList(),
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
