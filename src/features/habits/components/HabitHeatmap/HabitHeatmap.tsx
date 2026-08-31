'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';
import type { Habit } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';

export interface HabitHeatmapProps {
  logs: HabitLog[];
  habit?: Habit;
  weeksToShow?: number;
}

export function HabitHeatmap({ logs, habit, weeksToShow = 20 }: HabitHeatmapProps) {
  void habit;
  const days = useMemo(() => {
    const list: { date: string; dayOfWeek: number; status: 'completed' | 'partial' | 'skipped' | 'none'; value: number }[] = [];
    const today = new Date();

    const totalDays = weeksToShow * 7;
    const start = new Date(today);
    start.setDate(today.getDate() - totalDays + 1);

    for (let i = 0; i < totalDays; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      const dateStr = cur.toISOString().split('T')[0]!;
      const dayOfWeek = cur.getDay();

      const dayLogs = logs.filter((l) => l.date === dateStr);
      let status: 'completed' | 'partial' | 'skipped' | 'none' = 'none';
      let value = 0;

      if (dayLogs.some((l) => l.status === 'skipped')) {
        status = 'skipped';
      } else if (dayLogs.length > 0) {
        value = dayLogs.reduce((sum, l) => sum + l.value, 0);
        const hasComplete = dayLogs.some((l) => l.status === 'completed');
        status = hasComplete || value > 0 ? 'completed' : 'none';
      }

      list.push({ date: dateStr, dayOfWeek, status, value });
    }

    return list;
  }, [logs, weeksToShow]);

  const columns = useMemo(() => {
    const cols: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7));
    }
    return cols;
  }, [days]);

  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          overflowX: 'auto',
          pb: 1,
        }}
        role="region"
        aria-label="Mapa de calor de consistência do hábito"
      >
        <Stack direction="row" spacing={0.6}>
          {columns.map((week, colIdx) => (
            <Stack key={colIdx} spacing={0.6}>
              {week.map((day) => {
                const isCompleted = day.status === 'completed';
                const isPartial = day.status === 'partial';
                const isSkipped = day.status === 'skipped';

                let label = `${day.date}: Sem registros`;
                if (isCompleted) label = `${day.date}: Concluído (${day.value})`;
                else if (isPartial) label = `${day.date}: Parcial (${day.value})`;
                else if (isSkipped) label = `${day.date}: Pulo neutro planejado`;

                return (
                  <Tooltip key={day.date} title={label} arrow>
                    <Box
                      tabIndex={0}
                      aria-label={label}
                      sx={(theme) => ({
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        backgroundColor: isCompleted
                          ? themePalette(theme).kokyu.action.primary
                          : isPartial
                            ? themePalette(theme).kokyu.feedback.warning
                            : isSkipped
                              ? themePalette(theme).kokyu.border.strong
                              : themePalette(theme).kokyu.surface.secondary,
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        '&:hover': {
                          transform: 'scale(1.3)',
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
                        },
                      })}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Menos
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={(theme) => ({
              width: 10,
              height: 10,
              borderRadius: 0.5,
              backgroundColor: themePalette(theme).kokyu.surface.secondary,
            })}
          />
          <Box
            sx={(theme) => ({
              width: 10,
              height: 10,
              borderRadius: 0.5,
              backgroundColor: themePalette(theme).kokyu.feedback.warning,
            })}
          />
          <Box
            sx={(theme) => ({
              width: 10,
              height: 10,
              borderRadius: 0.5,
              backgroundColor: themePalette(theme).kokyu.action.primary,
            })}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Mais
        </Typography>
      </Stack>
    </Stack>
  );
}
