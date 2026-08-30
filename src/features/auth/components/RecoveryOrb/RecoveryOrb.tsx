'use client';

import { motion } from 'motion/react';

import { useEffectiveReducedMotion } from '@/design-system/providers/MotionPreferenceProvider';
import type { ColorScale } from '@/design-system/tokens/primitives/colors';
import { duration, motionEasing, msToSeconds } from '@/design-system/tokens/primitives/motion';

export interface RecoveryOrbProps {
  color: ColorScale;
  /**
   * Storybook-only override — `useReducedMotion()` caches its first
   * `matchMedia` read for the session (see `AuthTransition`), so a
   * story forces the reduced state deterministically instead.
   */
  reducedMotion?: boolean;
}

/**
 * Redraws the login visual panel's top-right orb for `/forgot-password`
 * with a one-shot "recompose" entrance: it starts smaller and dimmer —
 * as if the breathing rhythm had scattered — then settles into its
 * normal size, echoing "recuperar o ritmo" without introducing a new
 * visual language. The orb's continuous breathing loop (`kokyu-breathe`,
 * plain CSS, unchanged from the other auth screens) still runs
 * underneath; only this initial settle is Motion-driven.
 */
export function RecoveryOrb({ color, reducedMotion }: RecoveryOrbProps) {
  const shouldReduceMotion = useEffectiveReducedMotion(reducedMotion);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: msToSeconds(shouldReduceMotion ? duration.normal : duration.slower),
        ease: motionEasing.enter,
      }}
      style={{
        position: 'absolute',
        top: '8%',
        insetInlineEnd: '-10%',
        width: 380,
        height: 380,
        borderRadius: '50%',
        background: `radial-gradient(circle, color-mix(in srgb, ${color[500]} 55%, transparent) 0%, transparent 70%)`,
        filter: 'blur(2px)',
        animation: 'kokyu-breathe 7s ease-in-out infinite',
      }}
    />
  );
}
