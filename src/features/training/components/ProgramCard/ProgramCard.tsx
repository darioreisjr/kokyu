'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { programStatusLabels } from '../../constants/programLabels';
import { trainingRoutes } from '../../constants/trainingRoutes';
import type { TrainingProgram } from '../../types';

export interface ProgramCardProps {
  program: TrainingProgram;
}

const STATUS_CHIP_COLOR: Record<TrainingProgram['status'], 'default' | 'success' | 'warning'> = {
  draft: 'default',
  active: 'success',
  paused: 'warning',
  completed: 'default',
  archived: 'default',
};

export function ProgramCard({ program }: ProgramCardProps) {
  const totalScheduledRoutines = program.blocks.reduce(
    (total, block) =>
      total + block.weeks.reduce((weekTotal, week) => weekTotal + week.scheduledRoutines.length, 0),
    0,
  );

  return (
    <Box
      component={NextLink}
      href={trainingRoutes.program(program.id)}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        padding: 2,
        textDecoration: 'none',
        color: 'inherit',
      })}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="labelLarge" component="p">
          {program.name}
        </Typography>
        <Chip
          label={programStatusLabels[program.status]}
          size="small"
          color={STATUS_CHIP_COLOR[program.status]}
        />
      </Stack>
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {program.durationWeeks} semanas · {program.blocks.length} blocos · {totalScheduledRoutines}{' '}
        treinos planejados
      </Typography>
    </Box>
  );
}
