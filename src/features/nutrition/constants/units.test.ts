import { describe, expect, it } from 'vitest';

import {
  getUnitAbbreviation,
  getUnitDefinition,
  getUnitGroup,
  getUnitLabel,
  unitsByGroup,
} from './units';

describe('units constants', () => {
  it('resolves a unit definition by id', () => {
    expect(getUnitDefinition('kg')).toEqual({
      id: 'kg',
      group: 'weight',
      label: 'Quilograma',
      abbreviation: 'kg',
    });
  });

  it('throws for an unknown unit id', () => {
    // @ts-expect-error deliberately invalid unit for the throw path
    expect(() => getUnitDefinition('invalid')).toThrow('Unknown unit: invalid');
  });

  it('resolves group/label/abbreviation helpers', () => {
    expect(getUnitGroup('ml')).toBe('volume');
    expect(getUnitLabel('unidade')).toBe('Unidade');
    expect(getUnitAbbreviation('colher-sopa')).toBe('col. sopa');
  });

  it('groups every unit definition under its own unit group', () => {
    expect(unitsByGroup.weight.map((unit) => unit.id)).toEqual(['g', 'kg']);
    expect(unitsByGroup.volume.map((unit) => unit.id)).toEqual(['ml', 'l']);
    expect(unitsByGroup.culinary.map((unit) => unit.id)).toEqual([
      'colher-cha',
      'colher-sopa',
      'xicara',
    ]);
  });
});
