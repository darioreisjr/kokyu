/**
 * Kokyu Design System — breakpoint tokens.
 * Values match MUI's defaults so `theme.breakpoints` and these tokens
 * never drift apart; they already cover every target width from
 * 320px up to 1920px when used mobile-first (`up('sm')`, `up('md')`, ...).
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export type BreakpointToken = keyof typeof breakpoints;
