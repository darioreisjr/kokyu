import { defaultPreferences } from '../constants/defaultPreferences';
import type { UserPreferences } from '../types/preferences.types';

/** Bump when `UserPreferences`'s shape changes in a way older stored data can't safely merge into. */
export const PREFERENCES_SCHEMA_VERSION = 1;

const STORAGE_KEY = 'kokyu:preferences';

interface StoredPreferences {
  version: number;
  data: Partial<UserPreferences>;
}

/**
 * Shallow-merges each *section* over the defaults rather than trusting
 * a stored blob wholesale — protects against a schema change adding a
 * field an older stored value doesn't have, without needing a real
 * migration step for this first version.
 */
function mergeWithDefaults(stored: Partial<UserPreferences>): UserPreferences {
  return {
    general: { ...defaultPreferences.general, ...stored.general },
    appearance: { ...defaultPreferences.appearance, ...stored.appearance },
    navigation: { ...defaultPreferences.navigation, ...stored.navigation },
    locale: { ...defaultPreferences.locale, ...stored.locale },
    routine: { ...defaultPreferences.routine, ...stored.routine },
    notifications: {
      ...defaultPreferences.notifications,
      ...stored.notifications,
      categories: {
        ...defaultPreferences.notifications.categories,
        ...stored.notifications?.categories,
      },
    },
    sound: { ...defaultPreferences.sound, ...stored.sound },
    accessibility: { ...defaultPreferences.accessibility, ...stored.accessibility },
    privacy: { ...defaultPreferences.privacy, ...stored.privacy },
  };
}

/**
 * The one place that ever touches `localStorage` for preferences — no
 * component or hook calls it directly. Deliberately a separate key
 * from anything auth-related: passwords, tokens and session
 * identifiers never belong in this store, only visual/behavioral
 * preferences.
 *
 * Corrupted or unreadable data (bad JSON, wrong version, private-mode
 * storage exceptions, ...) always falls back to `defaultPreferences`
 * instead of throwing — a broken localStorage entry must never break
 * the app.
 */
export const preferencesStorage = {
  load(): UserPreferences {
    if (typeof window === 'undefined') return defaultPreferences;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultPreferences;

      const parsed = JSON.parse(raw) as Partial<StoredPreferences> | null;
      if (!parsed || typeof parsed !== 'object' || parsed.version !== PREFERENCES_SCHEMA_VERSION) {
        return defaultPreferences;
      }

      return mergeWithDefaults(parsed.data ?? {});
    } catch {
      return defaultPreferences;
    }
  },

  save(preferences: UserPreferences): void {
    if (typeof window === 'undefined') return;
    try {
      // A `preferences` value that's exactly the defaults needs no
      // entry at all — `load()` already falls back to
      // `defaultPreferences` when there's nothing stored, so writing
      // them out explicitly would just be a longer way to say the
      // same thing. This is also what keeps "Restaurar configurações"
      // (`resetPreferences`, which calls `save` via the same effect
      // right after calling `clear()` itself) actually *staying*
      // cleared, instead of this effect immediately writing the
      // defaults straight back.
      if (JSON.stringify(preferences) === JSON.stringify(defaultPreferences)) {
        preferencesStorage.clear();
        return;
      }

      const payload: StoredPreferences = {
        version: PREFERENCES_SCHEMA_VERSION,
        data: preferences,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Quota exceeded, private-mode restrictions, etc. — preferences
      // still work for the rest of the session, just don't persist.
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op — nothing meaningful to recover from here.
    }
  },

  /**
   * Whether *any* preferences have ever been saved — distinct from
   * `load()` returning `defaultPreferences`, which also happens for
   * corrupted/unreadable data. `AuthenticatedShell` uses this once
   * (never mid preference-change) to tell "brand new visitor, fall
   * back to the old tablet-collapses-by-default heuristic" apart from
   * "returning visitor whose `sidebarMode` happens to equal the
   * default" — the two only look identical by reading `sidebarMode`
   * itself.
   */
  hasStored(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  },
};
