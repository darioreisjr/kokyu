'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import type { GoalUnit } from '../../types';
import { formatGoalProgressAccessibleLabel } from '../../utils/goalFormatting';

export interface GoalProgressRingProps {
  current: number;
  target: number;
  percent: number;
  unit: GoalUnit;
  size?: number;
  /** Overrides the generated "X de Y <unidade>, Z%" caption — see `GoalProgressBar`. */
  label?: string;
}

/** Used on `/app/metas/[id]`'s header — everywhere else (`GoalCard`, lists) uses `GoalProgressBar` instead, per the spec's own "não usar apenas círculo decorativo. Mostrar valor textual." */
export function GoalProgressRing({
  current,
  target,
  percent,
  unit,
  size = 132,
  label,
}: GoalProgressRingProps) {
  const resolvedLabel = label ?? formatGoalProgressAccessibleLabel(current, target, unit, percent);
  return (
    <Stack spacing={1} sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          aria-hidden="true"
          variant="determinate"
          value={100}
          size={size}
          thickness={3.6}
          sx={(theme) => ({
            color: themePalette(theme).kokyu.background.subtle,
            position: 'absolute',
          })}
        />
        <CircularProgress
          aria-hidden="true"
          variant="determinate"
          value={percent}
          size={size}
          thickness={3.6}
          sx={(theme) => ({ color: themePalette(theme).kokyu.action.primary })}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" component="span">
            {percent}%
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, textAlign: 'center' })}
      >
        {resolvedLabel}
      </Typography>
    </Stack>
  );
}
