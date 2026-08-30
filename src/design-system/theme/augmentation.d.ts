import type * as React from 'react';

import type { SemanticColorTokens } from '../tokens/semantic';

/**
 * Exposes the full Kokyu semantic token set on the MUI theme as
 * `theme.palette.kokyu`, for the tokens (surface.*, icon.*, ...) that
 * don't have a direct equivalent in MUI's own palette vocabulary.
 */
declare module '@mui/material/styles' {
  interface Palette {
    kokyu: SemanticColorTokens;
  }
  interface PaletteOptions {
    kokyu: SemanticColorTokens;
  }

  interface TypographyVariants {
    displayLarge: React.CSSProperties;
    displayMedium: React.CSSProperties;
    displaySmall: React.CSSProperties;
    labelLarge: React.CSSProperties;
    labelMedium: React.CSSProperties;
    labelSmall: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    displayLarge?: React.CSSProperties;
    displayMedium?: React.CSSProperties;
    displaySmall?: React.CSSProperties;
    labelLarge?: React.CSSProperties;
    labelMedium?: React.CSSProperties;
    labelSmall?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    displayLarge: true;
    displayMedium: true;
    displaySmall: true;
    labelLarge: true;
    labelMedium: true;
    labelSmall: true;
  }
}
