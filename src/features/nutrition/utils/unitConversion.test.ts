import { describe, expect, it } from 'vitest';

import { areUnitsCompatible, convertUnit, formatQuantity, toBaseUnit } from './unitConversion';

describe('convertUnit', () => {
  it('converts 1000g to 1kg', () => {
    expect(convertUnit(1000, 'g', 'kg')).toBe(1);
  });

  it('converts 1000ml to 1l', () => {
    expect(convertUnit(1000, 'ml', 'l')).toBe(1);
  });

  it('converts kg back to g', () => {
    expect(convertUnit(1.5, 'kg', 'g')).toBe(1500);
  });

  it('returns the same quantity when converting a unit to itself', () => {
    expect(convertUnit(42, 'g', 'g')).toBe(42);
  });

  it('returns null across incompatible groups (weight to volume)', () => {
    expect(convertUnit(500, 'g', 'ml')).toBeNull();
  });

  it('returns null between two count units — never guesses a ratio', () => {
    expect(convertUnit(1, 'pacote', 'unidade')).toBeNull();
  });

  it('returns null for culinary units — cup-to-gram depends on the ingredient', () => {
    expect(convertUnit(1, 'xicara', 'g')).toBeNull();
  });
});

describe('areUnitsCompatible', () => {
  it('treats weight units as compatible with each other', () => {
    expect(areUnitsCompatible('g', 'kg')).toBe(true);
  });

  it('treats weight and volume as incompatible', () => {
    expect(areUnitsCompatible('g', 'ml')).toBe(false);
  });
});

describe('toBaseUnit', () => {
  it('normalizes kg down to g', () => {
    expect(toBaseUnit(1.5, 'kg')).toEqual({ quantity: 1500, unit: 'g' });
  });

  it('normalizes l down to ml', () => {
    expect(toBaseUnit(2, 'l')).toEqual({ quantity: 2000, unit: 'ml' });
  });

  it('leaves count units untouched — no base unit to normalize into', () => {
    expect(toBaseUnit(3, 'pacote')).toEqual({ quantity: 3, unit: 'pacote' });
  });
});

describe('formatQuantity', () => {
  it('formats a sub-1000 gram quantity as-is', () => {
    expect(formatQuantity(700, 'g')).toBe('700 g');
  });

  it('upgrades 1500g to a readable "1,5 kg"', () => {
    expect(formatQuantity(1500, 'g')).toBe('1,5 kg');
  });

  it('upgrades 2000ml to "2 l"', () => {
    expect(formatQuantity(2000, 'ml')).toBe('2 l');
  });

  it('formats a count unit with its abbreviation', () => {
    expect(formatQuantity(3, 'unidade')).toBe('3 un');
  });
});
