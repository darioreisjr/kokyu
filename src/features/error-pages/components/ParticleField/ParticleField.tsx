'use client';

import { useTheme } from '@mui/material/styles';
import { motion } from 'motion/react';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { ambientMotion } from '@/design-system/tokens/semantic/motion';

export interface ParticleFieldProps {
  /** Resolved once by `NotFoundAnimation` — real detection or an explicit override. */
  reducedMotion: boolean;
}

const PARTICLE_COUNT = 12;

interface Particle {
  id: number;
  cx: number;
  cy: number;
  radius: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  accent: boolean;
}

/**
 * Deterministic, fixed particle layout — computed once from the
 * index only (no `Math.random()`), so server and client render the
 * exact same markup and hydration never mismatches.
 */
function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT;
    const orbitRadius = 66 + ((i * 11) % 32);
    return {
      id: i,
      cx: 100 + Math.cos(angle) * orbitRadius,
      cy: 100 + Math.sin(angle) * orbitRadius,
      radius: 1.5 + (i % 3) * 0.5,
      driftX: Math.cos(angle + Math.PI / 2) * (4 + (i % 3)),
      driftY: Math.sin(angle + Math.PI / 2) * (4 + (i % 3)),
      duration: ambientMotion.particle.duration + (i % 4) * 0.7,
      delay: (i * 0.4) % ambientMotion.particle.duration,
      accent: i % 3 === 0,
    };
  });
}

const PARTICLES = buildParticles();

/** Small energy sparks drifting around the breathing orb. */
export function ParticleField({ reducedMotion: shouldReduceMotion }: ParticleFieldProps) {
  const theme = useTheme();
  const palette = themePalette(theme);
  const { ease } = ambientMotion.particle;

  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0 }}
    >
      {PARTICLES.map((particle) => {
        const color = particle.accent ? palette.warning.main : palette.primary.main;

        if (shouldReduceMotion) {
          return (
            <circle
              key={particle.id}
              cx={particle.cx}
              cy={particle.cy}
              r={particle.radius}
              fill={color}
              opacity={0.5}
            />
          );
        }

        return (
          <motion.circle
            key={particle.id}
            cx={particle.cx}
            cy={particle.cy}
            r={particle.radius}
            fill={color}
            animate={{
              x: [0, particle.driftX, 0],
              y: [0, particle.driftY, 0],
              opacity: [0.15, 0.75, 0.15],
              scale: [0.85, 1.15, 0.85],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease,
              repeat: Infinity,
            }}
          />
        );
      })}
    </svg>
  );
}
