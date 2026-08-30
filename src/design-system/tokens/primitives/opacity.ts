/** Kokyu Design System — opacity tokens. */
export const opacity = {
  disabled: 0.38,
  hover: 0.08,
  focus: 0.12,
  overlay: 0.6,
  muted: 0.64,
} as const;

export type OpacityToken = keyof typeof opacity;
