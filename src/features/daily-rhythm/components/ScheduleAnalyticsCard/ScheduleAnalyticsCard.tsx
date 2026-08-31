'use client';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { ScheduleAnalytics } from '@/shared/scheduling/types';
import { formatDurationDisplay } from '@/shared/scheduling/utils/timeHelpers';

export interface ScheduleAnalyticsCardProps {
  analytics: ScheduleAnalytics;
}

export function ScheduleAnalyticsCard({ analytics }: ScheduleAnalyticsCardProps) {
  return (
    <Box
      sx={(theme) => ({
        p: 2.5,
        borderRadius: 2,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
      })}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Análise do Uso do Tempo
      </Typography>

      <Stack spacing={2.5}>
        {/* Tempo por Origem */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
            Distribuição por Área
          </Typography>
          <Stack spacing={1}>
            {analytics.timeBySource.map((src) => (
              <Box key={src.sourceType}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {src.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  >
                    {formatDurationDisplay(src.minutes)} ({src.percentage}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={src.percentage}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Foco Stats */}
        <Box
          sx={(theme) => ({
            p: 2,
            borderRadius: 1.5,
            backgroundColor: themePalette(theme).kokyu.background.subtle,
          })}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
            Sessões de Foco
          </Typography>
          <Typography variant="caption" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, display: 'block' })}>
            {analytics.focus.totalSessions} sessões • {formatDurationDisplay(analytics.focus.totalDurationMinutes)} de foco total • Média de {formatDurationDisplay(analytics.focus.averageSessionMinutes)} por bloco.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

