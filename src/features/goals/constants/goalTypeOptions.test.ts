import { describe, expect, it } from 'vitest';

import { getGoalTypeOptionDefinition, goalTypeOptionDefinitions } from './goalTypeOptions';

describe('getGoalTypeOptionDefinition', () => {
  it('resolves every real option id', () => {
    for (const option of goalTypeOptionDefinitions) {
      expect(getGoalTypeOptionDefinition(option.id).id).toBe(option.id);
    }
  });

  it('"number" and "percentage" both resolve to the numeric strategy', () => {
    expect(getGoalTypeOptionDefinition('number').resultingType).toBe('numeric');
    expect(getGoalTypeOptionDefinition('percentage').resultingType).toBe('numeric');
  });

  it('only "percentage" presets a unit', () => {
    expect(getGoalTypeOptionDefinition('percentage').presetUnit).toBe('percentage');
    expect(getGoalTypeOptionDefinition('number').presetUnit).toBeUndefined();
  });
});
