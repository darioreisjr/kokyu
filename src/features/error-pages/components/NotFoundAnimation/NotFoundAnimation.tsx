'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { motion, type Variants } from 'motion/react';
import NextLink from 'next/link';

import { KokyuButton } from '@/design-system/components';
import { useEffectiveReducedMotion } from '@/design-system/providers/MotionPreferenceProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { duration, motionEasing, msToSeconds } from '@/design-system/tokens/primitives/motion';

import { BreathingOrb } from '../BreathingOrb/BreathingOrb';
import { NichirinSlash } from '../NichirinSlash/NichirinSlash';
import { ParticleField } from '../ParticleField/ParticleField';

export interface NotFoundAnimationProps {
  code: string;
  title: string;
  description: string;
  hint?: string;
  ctaLabel: string;
  ctaHref: string;
  /**
   * Overrides `prefers-reduced-motion` detection. `motion`'s
   * `useReducedMotion()` subscribes to `matchMedia` once and caches
   * that for the page's lifetime, which makes it unreliable to flip
   * live in a single Storybook session — this prop is what the
   * `ReducedMotion` story (and tests) use instead.
   */
  reducedMotion?: boolean;
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.05 } },
};

/**
 * The only Client Component on the 404 screen: it owns the entrance
 * stagger (visual scene → 404 → title → description → CTA, under ~1s
 * total) and the ambient scene itself. `NotFoundPage` stays a Server
 * Component and only hands this plain strings — see docs/architecture.md
 * for why a component needs `'use client'` the moment it reads the
 * theme inside `sx`, independent of whether it has real animation.
 */
export function NotFoundAnimation({
  code,
  title,
  description,
  hint,
  ctaLabel,
  ctaHref,
  reducedMotion,
}: NotFoundAnimationProps) {
  const theme = useTheme();
  const palette = themePalette(theme);
  const shouldReduceMotion = useEffectiveReducedMotion(reducedMotion);

  const itemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: msToSeconds(duration.slow), ease: motionEasing.standard },
    },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Stack spacing={{ xs: 3, sm: 4 }} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              position: 'relative',
              width: { xs: 176, sm: 220, md: 260 },
              height: { xs: 176, sm: 220, md: 260 },
            }}
          >
            <ParticleField reducedMotion={shouldReduceMotion} />
            <NichirinSlash reducedMotion={shouldReduceMotion} />
            <BreathingOrb reducedMotion={shouldReduceMotion} />
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            component="h1"
            variant="displayLarge"
            sx={{
              color: 'text.primary',
              textShadow: `0 0 2px color-mix(in srgb, ${palette.primary.main} 55%, transparent), 0 0 18px color-mix(in srgb, ${palette.primary.main} 25%, transparent)`,
            }}
          >
            {code}
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography component="h2" variant="h2" sx={{ color: 'text.primary' }}>
            {title}
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Stack spacing={0.5} sx={{ maxWidth: 440 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {description}
            </Typography>
            {hint ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {hint}
              </Typography>
            ) : null}
          </Stack>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        >
          <KokyuButton component={NextLink} href={ctaHref} size="large">
            {ctaLabel}
          </KokyuButton>
        </motion.div>
      </Stack>
    </motion.div>
  );
}
