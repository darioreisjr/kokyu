'use client';

import { useTheme } from '@mui/material/styles';
import { motion } from 'motion/react';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { ambientMotion } from '@/design-system/tokens/semantic/motion';

export interface BreathingOrbProps {
  /** Resolved once by `NotFoundAnimation` — real detection or an explicit override. */
  reducedMotion: boolean;
}

/**
 * The composition's central figure: a slow, continuous pulse standing
 * in for breath — inspire, hold, expire. Pure SVG, animated only on
 * `transform`/`opacity` (cheap, compositor-only properties).
 */
export function BreathingOrb({ reducedMotion: shouldReduceMotion }: BreathingOrbProps) {
  const theme = useTheme();
  const palette = themePalette(theme);
  const { duration, ease } = ambientMotion.breath;

  const pulse = shouldReduceMotion
    ? { scale: 1, opacity: 0.7 }
    : { scale: [1, 1.05, 1], opacity: [0.55, 0.85, 0.55] };
  const ringPulse = shouldReduceMotion
    ? { scale: 1, opacity: 0.45 }
    : { scale: [1.02, 1, 1.02], opacity: [0.3, 0.5, 0.3] };

  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="kokyu-orb-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.primary.main} stopOpacity={0.9} />
          <stop offset="100%" stopColor={palette.primary.main} stopOpacity={0} />
        </radialGradient>
      </defs>

      <motion.circle
        cx={100}
        cy={100}
        r={70}
        fill="url(#kokyu-orb-core)"
        style={{ transformOrigin: '100px 100px', filter: 'blur(1px)' }}
        animate={pulse}
        transition={{ duration, ease, repeat: shouldReduceMotion ? 0 : Infinity }}
      />
      <motion.circle
        cx={100}
        cy={100}
        r={92}
        fill="none"
        stroke={palette.secondary.main}
        strokeWidth={1.5}
        style={{ transformOrigin: '100px 100px' }}
        animate={ringPulse}
        transition={{
          duration: duration * 1.15,
          ease,
          repeat: shouldReduceMotion ? 0 : Infinity,
        }}
      />
      <circle cx={100} cy={100} r={5} fill={palette.text.primary} />
    </svg>
  );
}
