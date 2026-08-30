/** Kokyu Design System — motion tokens. */
export const duration = {
  instant: '0ms',
  fast: '120ms',
  normal: '200ms',
  slow: '320ms',
  /** Whole-screen transitions (e.g. login ↔ create account) — longer than any single-element feedback duration. */
  slower: '480ms',
} as const;

export const easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;

/**
 * Cubic-bezier control points for Motion's `ease` transition option,
 * which wants a numeric tuple rather than the CSS strings above.
 * `standard` mirrors `easing.standard` exactly (same curve, JS-array
 * form); `organic` is a new, symmetric ease-in-out — the asymmetric
 * UI curves above are tuned for one-shot feedback and read as
 * mechanical when looped continuously (breathing, drifting particles).
 */
export const motionEasing = {
  standard: [0.4, 0, 0.2, 1],
  /** Mirrors `easing.enter` — content arriving on screen. */
  enter: [0, 0, 0.2, 1],
  /** Mirrors `easing.exit` — content leaving the screen. */
  exit: [0.4, 0, 1, 1],
  organic: [0.45, 0.05, 0.55, 0.95],
} as const;

/**
 * Raw duration scale, in seconds, for continuous/looping decorative
 * motion — an order of magnitude longer than `duration` above, which
 * is in milliseconds for one-shot CSS `transition-duration` use.
 */
export const ambientDuration = {
  short: 4,
  medium: 6,
  long: 9,
  extraLong: 14,
} as const;

export type MotionEasingToken = keyof typeof motionEasing;
export type AmbientDurationToken = keyof typeof ambientDuration;

/** Converts a `duration.*` ms-string (e.g. `'320ms'`) to seconds for Motion. */
export function msToSeconds(msValue: string): number {
  return Number.parseFloat(msValue) / 1000;
}
