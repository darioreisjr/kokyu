/**
 * Kokyu Design System — typography tokens.
 * Font families are referenced by CSS variable name here; the actual
 * `next/font` loaders that populate those variables live in
 * `design-system/theme/fonts.ts` so this file stays framework-agnostic.
 */
export const fontFamily = {
  /** Body copy, form fields, UI chrome. */
  sans: 'var(--font-kokyu-sans)',
  /** Display headings and the Kokyu wordmark. */
  display: 'var(--font-kokyu-display)',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export type TypeScaleToken = {
  readonly fontSize: string;
  readonly lineHeight: number;
  readonly letterSpacing: string;
  readonly fontWeight: number;
  readonly fontFamily: string;
};

export const typeScale = {
  displayLarge: {
    fontSize: 'clamp(2.5rem, 2rem + 2.5vw, 4rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontWeight: fontWeight.bold,
    fontFamily: fontFamily.display,
  },
  displayMedium: {
    fontSize: 'clamp(2rem, 1.6rem + 2vw, 3.25rem)',
    lineHeight: 1.08,
    letterSpacing: '-0.015em',
    fontWeight: fontWeight.bold,
    fontFamily: fontFamily.display,
  },
  displaySmall: {
    fontSize: 'clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem)',
    lineHeight: 1.12,
    letterSpacing: '-0.01em',
    fontWeight: fontWeight.bold,
    fontFamily: fontFamily.display,
  },
  heading1: {
    fontSize: 'clamp(1.75rem, 1.55rem + 1vw, 2.25rem)',
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    fontWeight: fontWeight.bold,
    fontFamily: fontFamily.display,
  },
  heading2: {
    fontSize: 'clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)',
    lineHeight: 1.24,
    letterSpacing: '-0.008em',
    fontWeight: fontWeight.bold,
    fontFamily: fontFamily.display,
  },
  heading3: {
    fontSize: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',
    lineHeight: 1.28,
    letterSpacing: '-0.005em',
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.display,
  },
  heading4: {
    fontSize: 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',
    lineHeight: 1.32,
    letterSpacing: '0em',
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.sans,
  },
  heading5: {
    fontSize: '1.125rem',
    lineHeight: 1.36,
    letterSpacing: '0em',
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.sans,
  },
  heading6: {
    fontSize: '1rem',
    lineHeight: 1.4,
    letterSpacing: '0em',
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.sans,
  },
  bodyLarge: {
    fontSize: '1.125rem',
    lineHeight: 1.6,
    letterSpacing: '0em',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.sans,
  },
  bodyMedium: {
    fontSize: '1rem',
    lineHeight: 1.6,
    letterSpacing: '0em',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.sans,
  },
  bodySmall: {
    fontSize: '0.875rem',
    lineHeight: 1.55,
    letterSpacing: '0em',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.sans,
  },
  labelLarge: {
    fontSize: '0.9375rem',
    lineHeight: 1.4,
    letterSpacing: '0.005em',
    fontWeight: fontWeight.medium,
    fontFamily: fontFamily.sans,
  },
  labelMedium: {
    fontSize: '0.8125rem',
    lineHeight: 1.4,
    letterSpacing: '0.01em',
    fontWeight: fontWeight.medium,
    fontFamily: fontFamily.sans,
  },
  labelSmall: {
    fontSize: '0.75rem',
    lineHeight: 1.35,
    letterSpacing: '0.02em',
    fontWeight: fontWeight.medium,
    fontFamily: fontFamily.sans,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    letterSpacing: '0.015em',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.sans,
  },
} as const satisfies Record<string, TypeScaleToken>;

export type TypeScaleKey = keyof typeof typeScale;
