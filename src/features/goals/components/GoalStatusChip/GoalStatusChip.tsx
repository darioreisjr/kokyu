'use client';

import Chip from '@mui/material/Chip';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { getGoalStatusLabel } from '../../constants/goalStatusLabels';
import type { GoalStatus } from '../../types';

export interface GoalStatusChipProps {
  status: GoalStatus;
}

/** Reuses the existing feedback semantic tokens — no new tokens needed for these 8 states (see `docs/goals.md`). The label always carries the meaning too, never color alone. */
export function GoalStatusChip({ status }: GoalStatusChipProps) {
  return (
    <Chip
      size="small"
      label={getGoalStatusLabel(status)}
      sx={(theme) => {
        const palette = themePalette(theme).kokyu;
        const backgroundColor =
          status === 'onTrack' || status === 'completed'
            ? palette.feedback.success
            : status === 'attention'
              ? palette.feedback.warning
              : status === 'atRisk'
                ? palette.feedback.error
                : palette.surface.secondary;
        const color =
          status === 'onTrack' ||
          status === 'attention' ||
          status === 'atRisk' ||
          status === 'completed'
            ? palette.text.inverse
            : palette.text.primary;
        return { backgroundColor, color };
      }}
    />
  );
}
