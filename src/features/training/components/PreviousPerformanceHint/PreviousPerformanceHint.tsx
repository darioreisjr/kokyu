'use client';

import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import type { PerformedSet } from '../../types';
import { formatWeight } from '../../utils/weightUnit';

export interface PreviousPerformanceHintProps {
  performedSets: PerformedSet[] | null;
  weightUnit: 'kg' | 'lb';
}

/** "Último treino: 80kg×8, 80kg×8, 80kg×7" — helps decide today's load without leaving the screen. */
export function PreviousPerformanceHint({
  performedSets,
  weightUnit,
}: PreviousPerformanceHintProps) {
  const completed = performedSets?.filter((set) => set.completed) ?? [];

  if (completed.length === 0) {
    return (
      <Typography
        variant="labelSmall"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        Sem histórico anterior
      </Typography>
    );
  }

  const summary = completed
    .map((set) =>
      typeof set.weightKg === 'number'
        ? `${formatWeight(set.weightKg, weightUnit)}×${set.reps ?? '?'}`
        : `${set.reps ?? set.durationSeconds ?? '?'}`,
    )
    .join(', ');

  return (
    <Typography
      variant="labelSmall"
      sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
    >
      Último treino: {summary}
    </Typography>
  );
}
