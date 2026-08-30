import { beforeEach, describe, expect, it } from 'vitest';

import { trainingPreferencesService } from './trainingPreferencesService';
import { resetTrainingDb, trainingDb } from './trainingMockDb';

describe('trainingPreferencesService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('returns the seeded preferences', async () => {
    const preferences = await trainingPreferencesService.getPreferences();
    expect(preferences.level).toBe('intermediate');
    expect(preferences.weightUnit).toBe('kg');
  });

  it('returns a copy, not the live db object', async () => {
    const preferences = await trainingPreferencesService.getPreferences();
    expect(preferences).not.toBe(trainingDb.preferences);
  });

  it('patches and persists preferences', async () => {
    const updated = await trainingPreferencesService.updatePreferences({
      weightUnit: 'lb',
      sessionsPerWeek: 5,
    });
    expect(updated.weightUnit).toBe('lb');
    expect(updated.sessionsPerWeek).toBe(5);

    const reloaded = await trainingPreferencesService.getPreferences();
    expect(reloaded.weightUnit).toBe('lb');
    expect(reloaded.sessionsPerWeek).toBe(5);
  });

  it('leaves untouched fields unchanged after a partial update', async () => {
    const before = await trainingPreferencesService.getPreferences();
    const updated = await trainingPreferencesService.updatePreferences({ sessionsPerWeek: 3 });
    expect(updated.level).toBe(before.level);
    expect(updated.e1rmFormula).toBe(before.e1rmFormula);
  });
});
