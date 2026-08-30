'use client';

import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import type { GoalUnit } from '../../types';
import { formatGoalProgressAccessibleLabel } from '../../utils/goalFormatting';

export interface GoalProgressBarProps {
  current: number;
  target: number;
  percent: number;
  unit: GoalUnit;
  /** Overrides the generated "X de Y <unidade>, Z%" caption — used for types (binary/milestone/keyResult) whose real progress isn't naturally "current of target units". */
  label?: string;
}

/**
 * The bar itself is `aria-hidden` — the `Typography` line right below it is the real accessible
 * equivalent (see the spec's own "Progresso: 8 de 20 livros, 40%"), so a screen reader hears the
 * sentence once instead of the bar's own generic progress announcement plus the same text again.
 */
export function GoalProgressBar({ current, target, percent, unit, label }: GoalProgressBarProps) {
  const resolvedLabel = label ?? formatGoalProgressAccessibleLabel(current, target, unit, percent);
  return (
    <Stack spacing={0.25} sx={{ width: '100%' }}>
      <LinearProgress
        aria-hidden="true"
        variant="determinate"
        value={percent}
        sx={(theme) => ({
          borderRadius: 999,
          backgroundColor: themePalette(theme).kokyu.background.subtle,
        })}
      />
      <Typography
        variant="labelSmall"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {resolvedLabel}
      </Typography>
    </Stack>
  );
}
