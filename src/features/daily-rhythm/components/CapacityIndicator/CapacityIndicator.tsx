'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { CapacityStatus, DailyCapacity } from '@/shared/scheduling/types';
import { formatDurationDisplay } from '@/shared/scheduling/utils/timeHelpers';

export interface CapacityIndicatorProps {
  capacity: DailyCapacity | null;
  compact?: boolean;
}

const STATUS_LABELS: Record<CapacityStatus, { label: string; color: 'success' | 'info' | 'warning' | 'error' }> = {
  light: { label: 'Leve', color: 'info' },
  balanced: { label: 'Equilibrado', color: 'success' },
  full: { label: 'Cheio', color: 'warning' },
  overcapacity: { label: 'Acima da capacidade', color: 'error' },
};

export function CapacityIndicator({ capacity, compact = false }: CapacityIndicatorProps) {
  if (!capacity) return null;

  const statusConfig = STATUS_LABELS[capacity.status] ?? STATUS_LABELS.balanced;
  const isOver = capacity.status === 'overcapacity';

  return (
    <Box
      sx={(theme) => {
        const palette = themePalette(theme);
        return {
          p: compact ? 1.25 : 2,
          borderRadius: 2,
          backgroundColor: palette.kokyu.surface.primary,
          border: `1px solid ${palette.kokyu.border.subtle}`,
        };
      }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Carga do dia
        </Typography>

        <Chip
          label={statusConfig.label}
          color={statusConfig.color}
          size="small"
          sx={{ fontWeight: 600, height: 22 }}
        />
      </Stack>

      <LinearProgress
        variant="determinate"
        value={Math.min(100, capacity.utilizationPercent)}
        color={statusConfig.color}
        sx={{ height: 6, borderRadius: 3, mb: 1 }}
      />

      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Planejado: {formatDurationDisplay(capacity.plannedWorkloadMinutes)} de{' '}
          {formatDurationDisplay(capacity.availableMinutes)} livres ({capacity.utilizationPercent}%)
        </Typography>

        {isOver && (
          <Typography
            variant="caption"
            sx={(theme) => ({
              color: themePalette(theme).kokyu.feedback.error,
              fontWeight: 600,
            })}
          >
            +{formatDurationDisplay(capacity.differenceMinutes)} excedente
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

