import { describe, expect, it } from 'vitest';

import { getPantryFreshnessStatus, isPantryItemLowStock } from './pantryFreshness';

const today = new Date(2026, 7, 29); // 29 Aug 2026, fixed — never the real system date.

describe('getPantryFreshnessStatus', () => {
  it('returns "unknown" when there is no expiration date', () => {
    expect(getPantryFreshnessStatus({ expirationDate: undefined }, today)).toBe('unknown');
  });

  it('returns "expired" for a past date', () => {
    expect(getPantryFreshnessStatus({ expirationDate: '2026-08-28' }, today)).toBe('expired');
  });

  it('returns "expiring" within the configured window (today)', () => {
    expect(getPantryFreshnessStatus({ expirationDate: '2026-08-29' }, today)).toBe('expiring');
  });

  it('returns "expiring" at exactly the edge of the window (3 days out)', () => {
    expect(getPantryFreshnessStatus({ expirationDate: '2026-09-01' }, today)).toBe('expiring');
  });

  it('returns "fresh" just past the window (4 days out)', () => {
    expect(getPantryFreshnessStatus({ expirationDate: '2026-09-02' }, today)).toBe('fresh');
  });

  it('returns "fresh" for a far-future date', () => {
    expect(getPantryFreshnessStatus({ expirationDate: '2026-12-01' }, today)).toBe('fresh');
  });
});

describe('isPantryItemLowStock', () => {
  it('is low stock when quantity is at or below the minimum', () => {
    expect(isPantryItemLowStock({ quantity: 300, minimumStock: 500 })).toBe(true);
    expect(isPantryItemLowStock({ quantity: 500, minimumStock: 500 })).toBe(true);
  });

  it('is not low stock above the minimum', () => {
    expect(isPantryItemLowStock({ quantity: 600, minimumStock: 500 })).toBe(false);
  });

  it('is not low stock when no minimum is configured', () => {
    expect(isPantryItemLowStock({ quantity: 0, minimumStock: undefined })).toBe(false);
  });
});
