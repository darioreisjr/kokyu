/**
 * Kokyu Design System — shadow tokens.
 * Tuned for a dark-first surface: elevation reads through layered,
 * fairly opaque black shadows rather than soft light-mode blurs.
 */
export const shadow = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.24)',
  sm: '0 2px 4px -1px rgba(0, 0, 0, 0.28), 0 1px 2px -1px rgba(0, 0, 0, 0.24)',
  md: '0 4px 8px -2px rgba(0, 0, 0, 0.32), 0 2px 4px -2px rgba(0, 0, 0, 0.24)',
  lg: '0 12px 24px -4px rgba(0, 0, 0, 0.36), 0 4px 8px -4px rgba(0, 0, 0, 0.24)',
  xl: '0 24px 48px -8px rgba(0, 0, 0, 0.44), 0 8px 16px -8px rgba(0, 0, 0, 0.28)',
} as const;

export const semanticShadow = {
  card: shadow.sm,
  modal: shadow.xl,
  dropdown: shadow.lg,
  /** Decorative glow layered behind the accessible `outline` focus indicator. */
  focus: '0 0 0 4px rgba(255, 107, 61, 0.45)',
} as const;

export type ShadowToken = keyof typeof shadow;
export type SemanticShadowToken = keyof typeof semanticShadow;
