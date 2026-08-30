import type { PaletteOptions } from '@mui/material/styles';

import { opacity } from '../tokens/primitives/opacity';
import {
  getThemeSemanticTokens,
  type AccentStyle,
  type ColorScheme,
  type ContrastMode,
  type SemanticColorTokens,
} from '../tokens/semantic';

export type KokyuPaletteOptions = PaletteOptions & { kokyu: SemanticColorTokens };

export function createKokyuPalette(
  scheme: ColorScheme,
  accent: AccentStyle = 'hinokami',
  contrast: ContrastMode = 'normal',
): KokyuPaletteOptions {
  const tokens = getThemeSemanticTokens(scheme, accent, contrast);

  return {
    mode: scheme,
    primary: {
      main: tokens.action.primary,
      light: tokens.action.primaryHover,
      dark: tokens.action.primaryActive,
      contrastText: tokens.action.primaryContrast,
    },
    secondary: {
      main: tokens.action.secondary,
      light: tokens.action.secondaryHover,
      dark: tokens.action.secondaryActive,
      contrastText: tokens.action.secondaryContrast,
    },
    error: { main: tokens.feedback.error, contrastText: tokens.action.primaryContrast },
    warning: { main: tokens.feedback.warning, contrastText: tokens.text.inverse },
    info: { main: tokens.feedback.info, contrastText: tokens.action.primaryContrast },
    success: { main: tokens.feedback.success, contrastText: tokens.action.primaryContrast },
    background: {
      default: tokens.background.default,
      paper: tokens.background.paper,
    },
    text: {
      primary: tokens.text.primary,
      secondary: tokens.text.secondary,
      disabled: tokens.text.disabled,
    },
    divider: tokens.border.default,
    action: {
      disabled: tokens.action.disabled,
      disabledBackground: tokens.action.disabledBackground,
      hoverOpacity: opacity.hover,
      focusOpacity: opacity.focus,
      disabledOpacity: opacity.disabled,
    },
    kokyu: tokens,
  };
}
