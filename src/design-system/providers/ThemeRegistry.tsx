'use client';

import CssBaseline from '@mui/material/CssBaseline';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { useEffect, useMemo, type ReactNode } from 'react';

import type { AccentStyle, ContrastMode } from '../tokens/semantic';
import { KOKYU_DEFAULT_COLOR_SCHEME, createKokyuTheme } from '../theme';

type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeRegistryProps {
  children: ReactNode;
  /** @default 'hinokami' — Settings → Aparência → "Estilo de respiração". */
  accent?: AccentStyle;
  /** @default 'normal' — Settings → Aparência → "Contraste". */
  contrast?: ContrastMode;
  /** @default 'system' — Settings → Aparência → "Tema"; synced into MUI's own mode below. */
  themeMode?: ThemeMode;
  /**
   * Set this to the preferences provider's own `isHydrated` once one
   * exists. Before that, `themeMode` is only ever the *default*
   * ('system') rendered to match SSR — syncing it in that state would
   * overwrite a returning user's actually-stored 'dark'/'light' choice
   * with a system-resolved guess for one frame, then immediately
   * correct it again once the real value loads: two flashes instead
   * of `InitColorSchemeScript`'s normal zero. @default true
   */
  themeModeReady?: boolean;
}

/**
 * Mirrors `preferences.appearance.theme` into MUI's own `useColorScheme`
 * mode — needed for `useThemeMode`'s `setTheme` (a direct user action)
 * *and* for a page load where nothing was ever clicked: without this,
 * "Sistema" would sit selected in Settings while the app just silently
 * kept whatever `InitColorSchemeScript`'s `defaultMode` painted first
 * (Kokyu's own dark-first default), never actually resolving the
 * visitor's OS preference. Deferred a microtask for the same
 * `set-state-in-effect` reason as everywhere else in this codebase.
 * Must render *inside* `ThemeProvider` — `useColorScheme` needs that
 * context, which `ThemeRegistry` itself is still in the middle of
 * creating.
 */
function ThemeModeSync({ mode, ready }: { mode: ThemeMode; ready: boolean }) {
  const { setMode } = useColorScheme();

  useEffect(() => {
    if (!ready) return;
    queueMicrotask(() => setMode(mode));
  }, [mode, ready, setMode]);

  return null;
}

/**
 * `accent`/`contrast` recompute the theme object via `useMemo` — cheap
 * enough (a handful of `createTheme` calls) for how rarely they
 * actually change, and MUI's own light/dark *mode* state (managed by
 * `useColorScheme` inside `ThemeProvider`) survives a `theme` prop
 * swap fine, since the new theme still declares the same `light`/`dark`
 * scheme keys — only the palette *values* inside them differ.
 *
 * `InitColorSchemeScript` still only knows about `accent`'s default
 * (Hinokami) at first paint — see `PreferencesProvider`'s doc comment
 * for why a stored accent can briefly flash to it before React
 * hydrates, same trade-off as the sidebar-collapse preference.
 */
export function ThemeRegistry({
  children,
  accent = 'hinokami',
  contrast = 'normal',
  themeMode = 'system',
  themeModeReady = true,
}: ThemeRegistryProps) {
  const theme = useMemo(() => createKokyuTheme(accent, contrast), [accent, contrast]);

  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <InitColorSchemeScript attribute="data" defaultMode={KOKYU_DEFAULT_COLOR_SCHEME} />
      <ThemeProvider
        theme={theme}
        defaultMode={KOKYU_DEFAULT_COLOR_SCHEME}
        disableTransitionOnChange
      >
        <CssBaseline enableColorScheme />
        <ThemeModeSync mode={themeMode} ready={themeModeReady} />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
