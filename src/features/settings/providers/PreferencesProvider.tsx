'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { defaultPreferences } from '../constants/defaultPreferences';
import { preferencesStorage } from '../services/preferencesStorage';
import type { UserPreferences } from '../types/preferences.types';

export interface PreferencesContextValue {
  preferences: UserPreferences;
  /** `false` until the real stored value (if any) has been read — see the doc comment below. */
  isHydrated: boolean;
  updateSection: <K extends keyof UserPreferences>(
    section: K,
    patch: Partial<UserPreferences[K]>,
  ) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/**
 * The single source of truth for `UserPreferences` — every settings
 * control reads/writes through `usePreferences()` instead of touching
 * `localStorage` itself. Renders with `defaultPreferences` on the
 * server *and* the client's first paint (so there's nothing for React
 * to reconcile differently — no hydration mismatch), then loads the
 * real stored value shortly after mount. That means a preference a
 * user has changed can flash back to its default for one frame on
 * load; same accepted trade-off `KokyuAppShell` already makes for the
 * sidebar-collapse preference, and for the same reason: reading
 * `localStorage` during the render that must match the server's HTML
 * would itself be the mismatch.
 *
 * Every change is persisted immediately (no "Salvar alterações" step)
 * — see `SettingsRow`'s "Salvo automaticamente" affordance.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Deferred to a microtask rather than read synchronously here —
    // the React Compiler flags a synchronous `setState` at the top of
    // an effect body (`react-hooks/set-state-in-effect`); same fix
    // used by `useUsernameAvailability` and `KokyuAppShell`.
    queueMicrotask(() => {
      setPreferences(preferencesStorage.load());
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    preferencesStorage.save(preferences);
  }, [preferences, isHydrated]);

  // Text size, contrast and density apply through plain CSS, keyed off
  // attributes on <html> — the same `data-*` + attribute-selector
  // pattern MUI's own `InitColorSchemeScript` uses for color scheme,
  // just without a pre-hydration script (see the trade-off above).
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-kokyu-text-size', preferences.appearance.textSize);
    root.setAttribute('data-kokyu-contrast', preferences.appearance.contrast);
    root.setAttribute('data-kokyu-density', preferences.appearance.density);
  }, [
    preferences.appearance.textSize,
    preferences.appearance.contrast,
    preferences.appearance.density,
  ]);

  // "Sublinhar links"/"Foco reforçado" (Acessibilidade) — same
  // attribute pattern, consumed by the `MuiCssBaseline` overrides in
  // `theme/components.ts` rather than `globals.css`, since they need
  // real theme tokens (the focus ring color) that a static CSS file
  // has no access to.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(
      'data-kokyu-underline-links',
      String(preferences.accessibility.underlineLinks),
    );
    root.setAttribute('data-kokyu-enhanced-focus', String(preferences.accessibility.enhancedFocus));
  }, [preferences.accessibility.underlineLinks, preferences.accessibility.enhancedFocus]);

  const updateSection = useCallback(
    <K extends keyof UserPreferences>(section: K, patch: Partial<UserPreferences[K]>) => {
      setPreferences((current) => ({
        ...current,
        [section]: { ...current[section], ...patch },
      }));
    },
    [],
  );

  const resetPreferences = useCallback(() => {
    // No explicit `preferencesStorage.clear()` needed here — the
    // persist effect above runs right after this state update and
    // itself detects a defaults-equal value, clearing storage there.
    setPreferences(defaultPreferences);
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ preferences, isHydrated, updateSection, resetPreferences }),
    [preferences, isHydrated, updateSection, resetPreferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
