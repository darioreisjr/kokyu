import { beforeEach, describe, expect, it } from 'vitest';

import { resetLeisureDb } from './leisureMockDb';
import { getSuggestionsForAvailableTime } from './suggestionService';

describe('suggestionService.getSuggestionsForAvailableTime', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('returns fitting items from the live mock database for a short window', async () => {
    const results = await getSuggestionsForAvailableTime({ durationMinutes: 30 });
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.effectiveDuration ?? 0).toBeLessThanOrEqual(30);
    }
  });

  it('returns nothing impossibly short', async () => {
    const results = await getSuggestionsForAvailableTime({ durationMinutes: 1 });
    expect(results).toHaveLength(0);
  });
});
