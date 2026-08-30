'use client';

import { useTheme } from '@mui/material/styles';
import { motion } from 'motion/react';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { ambientMotion } from '@/design-system/tokens/semantic/motion';

export interface NichirinSlashProps {
  /** Resolved once by `NotFoundAnimation` — real detection or an explicit override. */
  reducedMotion: boolean;
}

/**
 * An abstract, stylized cut — conceptually a Nichirin blade slash,
 * never a literal sword. Drawn with `pathLength` on a long interval
 * ("intervalos maiores, não continuamente em alta velocidade"), using
 * the calmer Mizu family to read as the interrupted path itself.
 */
export function NichirinSlash({ reducedMotion: shouldReduceMotion }: NichirinSlashProps) {
  const theme = useTheme();
  const palette = themePalette(theme);
  const { duration: cycleDuration, ease } = ambientMotion.slashCycle;

  if (shouldReduceMotion) {
    return (
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0 }}
      >
        <line
          x1={28}
          y1={172}
          x2={172}
          y2={28}
          stroke={palette.info.main}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.35}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0 }}
    >
      <motion.line
        x1={28}
        y1={172}
        x2={172}
        y2={28}
        stroke={palette.info.main}
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 2.2,
          times: [0, 0.35, 0.7, 1],
          ease,
          repeat: Infinity,
          repeatDelay: cycleDuration,
        }}
      />
    </svg>
  );
}
