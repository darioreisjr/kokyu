'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { getHabitAreaDefinition } from '../../constants/habitAreas';
import type { HabitArea } from '../../types/habit.types';
import { themePalette } from '@/design-system/theme/useThemePalette';

export interface HabitAreaIconProps {
  area: HabitArea;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

export function HabitAreaIcon({ area, size = 'medium', sx }: HabitAreaIconProps) {
  const def = getHabitAreaDefinition(area);
  const IconComponent = def.icon;

  const dimension = size === 'small' ? 32 : size === 'large' ? 48 : 40;
  const iconSize = size === 'small' ? 18 : size === 'large' ? 26 : 22;

  return (
    <Box
      sx={[
        (theme) => ({
          width: dimension,
          height: dimension,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: themePalette(theme).kokyu.surface.secondary,
          color: themePalette(theme).kokyu.action.primary,
          flexShrink: 0,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      aria-hidden="true"
    >
      <IconComponent sx={{ fontSize: iconSize }} />
    </Box>
  );
}
