import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, type RenderOptions } from '@testing-library/react';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { ReactElement, ReactNode } from 'react';

import { MotionPreferenceProvider } from '@/design-system/providers/MotionPreferenceProvider';
import { SnackbarProvider } from '@/design-system/providers/SnackbarProvider';
import { kokyuTheme } from '@/design-system/theme';
import { CurrentUserProvider } from '@/features/current-user';
import { PreferencesProvider } from '@/features/settings';

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={kokyuTheme}>
      <CssBaseline />
      <PreferencesProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <MotionPreferenceProvider>
            <SnackbarProvider>
              {/* `null` by default — matches an unauthenticated/not-yet-
                  loaded snapshot, so existing tests written before this
                  context existed (which mock their own data source, e.g.
                  `profileService.getProfile`) keep behaving exactly as
                  they did. A test that needs a signed-in identity wraps
                  its own render with `<CurrentUserProvider
                  initialCurrentUser={mockCompleteCurrentUser}>` instead
                  of relying on this default. */}
              <CurrentUserProvider initialCurrentUser={null}>{children}</CurrentUserProvider>
            </SnackbarProvider>
          </MotionPreferenceProvider>
        </LocalizationProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}

function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
