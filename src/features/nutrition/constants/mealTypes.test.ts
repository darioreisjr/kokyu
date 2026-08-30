import { describe, expect, it } from 'vitest';

import { defaultMealTypes, getEnabledMealTypes } from './mealTypes';

describe('mealTypes constants', () => {
  it('has 6 default meal types in order', () => {
    expect(defaultMealTypes.map((mealType) => mealType.id)).toEqual([
      'cafe-da-manha',
      'lanche-da-manha',
      'almoco',
      'lanche-da-tarde',
      'jantar',
      'ceia',
    ]);
  });

  it('defaults to the module-level meal types when none are passed', () => {
    expect(getEnabledMealTypes()).toHaveLength(6);
  });

  it('filters out disabled meal types and sorts by order', () => {
    const custom = [
      { id: 'b', name: 'B', order: 1, enabled: true },
      { id: 'a', name: 'A', order: 0, enabled: true },
      { id: 'c', name: 'C', order: 2, enabled: false },
    ];
    expect(getEnabledMealTypes(custom).map((mealType) => mealType.id)).toEqual(['a', 'b']);
  });
});
