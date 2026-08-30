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
import { PreferencesProvider } from '@/features/settings';

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={kokyuTheme}>
      <CssBaseline />
      <PreferencesProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <MotionPreferenceProvider>
            <SnackbarProvider>{children}</SnackbarProvider>
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
