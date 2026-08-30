'use client';

import { useCallback, useEffect, useState } from 'react';

import { pantryService } from '../services/pantryService';
import { recipeService } from '../services/recipeService';
import type { PantryItem } from '../types/pantry.types';
import type { Recipe } from '../types/recipe.types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseRecipesResult {
  status: LoadStatus;
  recipes: Recipe[];
  pantryItems: PantryItem[];
  reload: () => void;
}

/** Recipes alongside the live pantry — the list view's "O que posso preparar?" and each card's availability both need both. */
export function useRecipes(): UseRecipesResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([recipeService.getRecipes(), pantryService.getPantry()])
      .then(([loadedRecipes, loadedPantryItems]) => {
        if (cancelled) return;
        setRecipes(loadedRecipes);
        setPantryItems(loadedPantryItems);
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

  return { status, recipes, pantryItems, reload };
}
