import { ambientDuration, duration, motionEasing, msToSeconds } from '../primitives/motion';

export interface AmbientMotionToken {
  /** Seconds — matches Motion's `transition.duration` unit. */
  duration: number;
  ease: (typeof motionEasing)['organic'];
}

/**
 * Semantic motion tokens for continuous, decorative animation loops —
 * the ambient counterpart to `duration`/`easing` (which are for
 * one-shot UI feedback). Each name describes *what* is animating, not
 * the raw numbers, so a slower/faster feel can be tuned in one place.
 */
export const ambientMotion = {
  /** The central breathing orb's scale/opacity pulse. */
  breath: { duration: ambientDuration.medium, ease: motionEasing.organic },
  /** Base duration particles drift around before looping. */
  particle: { duration: ambientDuration.long, ease: motionEasing.organic },
  /** How long the Nichirin slash waits between passes. */
  slashCycle: { duration: ambientDuration.extraLong, ease: motionEasing.organic },
} as const satisfies Record<string, AmbientMotionToken>;

/**
 * The login ↔ create-account whole-screen swap. `enterEase`/`exitEase`
 * mirror the CSS `easing.enter`/`easing.exit` tokens (Motion needs the
 * array form) so entering and leaving content don't share one curve.
 */
export const pageTransitionMotion = {
  duration: msToSeconds(duration.slower),
  enterEase: motionEasing.enter,
  exitEase: motionEasing.exit,
} as const;

/** The sidebar's expand/collapse width transition — quick and discreet, never a whole-screen change. */
export const sidebarCollapseMotion = {
  duration: msToSeconds(duration.fast),
  ease: motionEasing.standard,
} as const;
