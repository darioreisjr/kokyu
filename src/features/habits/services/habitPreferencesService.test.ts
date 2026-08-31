import { describe, expect, it } from 'vitest';
import { habitPreferencesService } from './habitPreferencesService';

describe('habitPreferencesService', () => {
  it('reads default preferences and updates them correctly', () => {
    const initial = habitPreferencesService.getPreferences();
    expect(initial.showStreak).toBe(true);

    const updated = habitPreferencesService.updatePreferences({
      showStreak: false,
    });
    expect(updated.showStreak).toBe(false);

    // Restore
    habitPreferencesService.updatePreferences({ showStreak: true });
  });
});

