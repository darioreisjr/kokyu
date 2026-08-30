import { nutritionConfig } from '../constants/nutritionConfig';
import type { PantryFreshnessStatus, PantryItem } from '../types/pantry.types';

/**
 * The one place "is this expiring soon" gets decided — every pantry
 * card, filter and badge reads this instead of re-comparing dates
 * (and re-typing the 3-day window) itself.
 */
export function getPantryFreshnessStatus(
  item: Pick<PantryItem, 'expirationDate'>,
  today: Date = new Date(),
): PantryFreshnessStatus {
  if (!item.expirationDate) return 'unknown';

  const expiration = new Date(`${item.expirationDate}T00:00:00`);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysUntilExpiration = Math.round(
    (expiration.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilExpiration < 0) return 'expired';
  if (daysUntilExpiration <= nutritionConfig.expiringSoonDays) return 'expiring';
  return 'fresh';
}

export function isPantryItemLowStock(item: Pick<PantryItem, 'quantity' | 'minimumStock'>): boolean {
  return item.minimumStock !== undefined && item.quantity <= item.minimumStock;
}
