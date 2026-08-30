'use client';

import { useEffect, useState } from 'react';

import { getShoppingNeedsForRange } from '../services/shoppingNeedsService';
import type { ShoppingNeedsSummary } from '../types/shoppingNeeds.types';

const emptySummary: ShoppingNeedsSummary = {
  items: [],
  totalIngredients: 0,
  alreadyInPantry: 0,
  needsPurchase: 0,
};

/** Reloads whenever `startDate`/`endDate`/`reloadKey` changes — pass a changing `reloadKey` after any meal/pantry edit that could shift the result. */
export function useShoppingNeeds(
  startDate: string,
  endDate: string,
  reloadKey: number,
): ShoppingNeedsSummary {
  const [summary, setSummary] = useState<ShoppingNeedsSummary>(emptySummary);

  useEffect(() => {
    let cancelled = false;
    getShoppingNeedsForRange(startDate, endDate).then((result) => {
      if (!cancelled) setSummary(result);
    });
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, reloadKey]);

  return summary;
}
