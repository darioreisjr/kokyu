import type { HabitPreferences } from '../types/preferences.types';
import { defaultHabitPreferences, habitDb } from './habitMockDb';

const STORAGE_KEY = 'kokyu_habit_preferences_v1';

export const habitPreferencesService = {
  getPreferences(): HabitPreferences {
    if (typeof window === 'undefined') {
      return habitDb.preferences;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...defaultHabitPreferences, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
    return habitDb.preferences;
  },

  updatePreferences(patch: Partial<HabitPreferences>): HabitPreferences {
    const updated: HabitPreferences = {
      ...this.getPreferences(),
      ...patch,
    };
    habitDb.preferences = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return updated;
  },
};

