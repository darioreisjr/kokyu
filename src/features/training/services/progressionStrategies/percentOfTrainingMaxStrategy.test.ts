import { describe, expect, it } from 'vitest';

import { suggestNextPercentOfTrainingMax } from './percentOfTrainingMaxStrategy';

describe('suggestNextPercentOfTrainingMax', () => {
  it('derives the target weight straight from trainingMax × percent, rounded to 0.25kg', () => {
    const result = suggestNextPercentOfTrainingMax({
      strategy: 'percentOfTrainingMax',
      trainingMaxKg: 100,
      percentOfMax: 82,
    });
    expect(result).toMatchObject({ suggestedWeightKg: 82 });
  });

  it('returns null for a non-matching config', () => {
    expect(suggestNextPercentOfTrainingMax({ strategy: 'manual' })).toBeNull();
  });
});
