import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { cardTokens } from '@/design-system/tokens/component';
import { themePalette } from '@/design-system/theme/useThemePalette';

export interface HomeSectionCardProps {
  children: ReactNode;
  compact?: boolean;
  /** A subtler surface for a card that's currently empty/low-signal — see spec's "CARD DENSITY". */
  muted?: boolean;
}

/**
 * The one card shell every Home component builds on — there's no shared
 * `Card` primitive in the Design System yet (every feature hand-rolls
 * `Box` + `cardTokens` + `themePalette`, see `docs/respiration-home.md`),
 * so this stays local to `features/home` rather than being promoted
 * prematurely for a single consumer.
 */
export function HomeSectionCard({ children, compact = false, muted = false }: HomeSectionCardProps) {
  return (
    <Box
      sx={(theme) => {
        const palette = themePalette(theme);
        return {
          borderRadius: cardTokens.radius,
          border: `1px solid ${palette.kokyu.border.subtle}`,
          backgroundColor: muted ? palette.kokyu.background.subtle : palette.kokyu.surface.primary,
          padding: compact ? 2 : 3,
          height: '100%',
        };
      }}
    >
      {children}
    </Box>
  );
}
