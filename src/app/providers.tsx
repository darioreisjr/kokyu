// `AdapterDateFns` is a plain class reference, not a React component
// the bundler recognizes as a client boundary — passing it as a prop
// from a Server Component fails to serialize, same underlying reason
// a theme-callback `sx` can't. This file needs `'use client'` itself.
'use client';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { ReactNode } from 'react';

import { MotionPreferenceProvider } from '@/design-system/providers/MotionPreferenceProvider';
import { SnackbarProvider } from '@/design-system/providers/SnackbarProvider';
import { ThemeRegistry } from '@/design-system/providers/ThemeRegistry';
import { PreferencesProvider, usePreferences } from '@/features/settings';

/**
 * Single place to compose every app-wide provider. `PreferencesProvider`
 * sits outermost since `ThemeRegistry` (accent/contrast) and
 * `MotionPreferenceProvider` (reduced motion) both read from it —
 * everything below `PreferenceAwareProviders` sees the *current*
 * preferences, not just the defaults.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <PreferenceAwareProviders>{children}</PreferenceAwareProviders>
    </PreferencesProvider>
  );
}

function PreferenceAwareProviders({ children }: { children: ReactNode }) {
  const { preferences, isHydrated } = usePreferences();

  return (
    <ThemeRegistry
      accent={preferences.appearance.accent}
      contrast={preferences.appearance.contrast}
      themeMode={preferences.appearance.theme}
      themeModeReady={isHydrated}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <MotionPreferenceProvider mode={preferences.accessibility.reducedMotion}>
          <SnackbarProvider>{children}</SnackbarProvider>
        </MotionPreferenceProvider>
      </LocalizationProvider>
    </ThemeRegistry>
  );
}
