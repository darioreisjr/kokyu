'use client';

import type { ThemeMode } from '../types/preferences.types';
import { usePreferences } from '../providers/PreferencesProvider';

export interface UseThemeModeResult {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

/**
 * Kokyu's own `preferences.appearance.theme` is the one source of
 * truth this hook writes to — `ThemeRegistry`'s `ThemeModeSync`
 * (mounted app-wide, not just where this hook happens to be used)
 * is what mirrors it into MUI's own `useColorScheme()` mode, so a
 * loaded-but-never-touched preference (someone who's never opened
 * Aparência) still resolves for real on every page, not only after
 * this hook has run once.
 */
export function useThemeMode(): UseThemeModeResult {
  const { preferences, updateSection } = usePreferences();

  const setTheme = (mode: ThemeMode) => {
    updateSection('appearance', { theme: mode });
  };

  return { theme: preferences.appearance.theme, setTheme };
}
