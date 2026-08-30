import { createTheme, type Theme } from '@mui/material/styles';

import { borderRadius } from '../tokens/primitives/borders';
import type { AccentStyle, ContrastMode } from '../tokens/semantic';
import { zIndex } from '../tokens/primitives/zIndex';
import { kokyuBreakpoints } from './breakpoints';
import { kokyuComponents } from './components';
import { createKokyuPalette } from './palette';
import { kokyuTypography } from './typography';

export { kokyuSans, kokyuDisplay, fontVariables } from './fonts';
export { createKokyuPalette } from './palette';
export type { KokyuPaletteOptions } from './palette';

/**
 * Kokyu's default color scheme. The identity for this first release
 * (login) leans on the dark Nichirin + Hinokami + Fuji combination —
 * see docs/design-system.md, section "Tema inicial".
 */
export const KOKYU_DEFAULT_COLOR_SCHEME = 'dark' as const;

/**
 * `accent`/`contrast` default to Kokyu's own baseline (Hinokami,
 * normal) so every existing caller — `kokyuTheme` below, Storybook,
 * tests — keeps working unchanged. `ThemeRegistry` is the one caller
 * that recomputes this reactively from the user's Settings → Aparência
 * preferences (`useMemo`, not a fresh object per render).
 */
export function createKokyuTheme(
  accent: AccentStyle = 'hinokami',
  contrast: ContrastMode = 'normal',
): Theme {
  return createTheme({
    cssVariables: {
      colorSchemeSelector: 'data',
    },
    defaultColorScheme: KOKYU_DEFAULT_COLOR_SCHEME,
    colorSchemes: {
      light: { palette: createKokyuPalette('light', accent, contrast) },
      dark: { palette: createKokyuPalette('dark', accent, contrast) },
    },
    spacing: 4,
    shape: {
      borderRadius: Number.parseInt(borderRadius.lg, 10),
    },
    breakpoints: kokyuBreakpoints,
    typography: kokyuTypography,
    components: kokyuComponents,
    zIndex: {
      mobileStepper: zIndex.base + 1000,
      fab: zIndex.dropdown,
      speedDial: zIndex.dropdown,
      appBar: zIndex.sticky,
      drawer: zIndex.drawer,
      modal: zIndex.modal,
      snackbar: zIndex.toast,
      tooltip: zIndex.tooltip,
    },
  });
}

export const kokyuTheme = createKokyuTheme();
