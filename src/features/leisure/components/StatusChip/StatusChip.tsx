'use client';

import Chip from '@mui/material/Chip';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { getStatusLabel } from '../../constants/leisureStatuses';
import type { LeisureItemStatus, LeisureItemType } from '../../types/leisureItem.types';

export interface StatusChipProps {
  type: LeisureItemType;
  status: LeisureItemStatus;
}

/** Reuses the existing feedback semantic tokens (success/warning/info) — no new tokens needed for these states. Never the only signal for a state (the label text always carries the meaning too). */
export function StatusChip({ type, status }: StatusChipProps) {
  return (
    <Chip
      size="small"
      label={getStatusLabel(type, status)}
      sx={(theme) => {
        const palette = themePalette(theme).kokyu;
        const backgroundColor =
          status === 'completed'
            ? palette.feedback.success
            : status === 'inProgress'
              ? palette.feedback.info
              : status === 'paused' || status === 'abandoned'
                ? palette.feedback.warning
                : palette.surface.secondary;
        const color =
          status === 'backlog' || status === 'planned' || status === 'archived'
            ? palette.text.primary
            : palette.text.inverse;
        return { backgroundColor, color };
      }}
    />
  );
}
