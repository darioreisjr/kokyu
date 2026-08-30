import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { Decorator, Preview } from '@storybook/nextjs-vite';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { Viewport } from 'storybook/viewport';

import { MotionPreferenceProvider } from '../src/design-system/providers/MotionPreferenceProvider';
import { SnackbarProvider } from '../src/design-system/providers/SnackbarProvider';
import { kokyuTheme } from '../src/design-system/theme';
import { PreferencesProvider } from '../src/features/settings';

const kokyuViewports: Record<string, Viewport> = {
  mobileSmall: {
    name: 'Mobile Small (360px)',
    styles: { width: '360px', height: '740px' },
    type: 'mobile',
  },
  mobile: {
    name: 'Mobile (390px)',
    styles: { width: '390px', height: '844px' },
    type: 'mobile',
  },
  mobileLarge: {
    name: 'Mobile Large (480px)',
    styles: { width: '480px', height: '960px' },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet (820px)',
    styles: { width: '820px', height: '1180px' },
    type: 'tablet',
  },
  laptop: {
    name: 'Laptop (1280px)',
    styles: { width: '1280px', height: '832px' },
    type: 'desktop',
  },
  desktop: {
    name: 'Desktop (1920px)',
    styles: { width: '1920px', height: '1080px' },
    type: 'desktop',
  },
};

const withKokyuTheme: Decorator = (Story) => (
  <ThemeProvider theme={kokyuTheme}>
    <CssBaseline />
    <PreferencesProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <MotionPreferenceProvider>
          <SnackbarProvider>
            <Story />
          </SnackbarProvider>
        </MotionPreferenceProvider>
      </LocalizationProvider>
    </PreferencesProvider>
  </ThemeProvider>
);

const preview: Preview = {
  decorators: [withKokyuTheme],
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: kokyuViewports,
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
