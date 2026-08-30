import type { Theme } from '@mui/material/styles';

/**
 * `theme.vars` is typed as optional because a non-CSS-variables theme
 * wouldn't have it — Kokyu's theme always enables `cssVariables`, so
 * this just gives style overrides and `sx` callbacks a palette that's
 * both var()-aware and non-nullable, instead of `theme.vars!` everywhere.
 */
export function themePalette(theme: Theme) {
  return (theme.vars ?? theme).palette;
}
