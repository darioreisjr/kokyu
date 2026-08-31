'use client';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { fromDateKey } from '@/features/leisure/utils/dateHelpers';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { useWeeklyRhythm } from '../../hooks/useWeeklyRhythm';
import type { DayScheduleSummary } from '../../services/weeklyPlanningService';
import { ScheduleEntryCard } from '../ScheduleEntryCard/ScheduleEntryCard';
import { WeeklyPlanningDialog } from '../WeeklyPlanningDialog/WeeklyPlanningDialog';

export function WeeklyView() {
  const {
    currentWeekStart,
    weeklyData,
    isLoading,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    refreshWeekly,
  } = useWeeklyRhythm();

  const [weeklyPlanOpen, setWeeklyPlanOpen] = useState(false);

  const startFormatted = format(currentWeekStart, "d 'de' MMMM", { locale: ptBR });
  const daysList: DayScheduleSummary[] = weeklyData?.days ?? [];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header controls */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton size="small" onClick={goToPreviousWeek} aria-label="Semana anterior">
            <ChevronLeftRoundedIcon />
          </IconButton>

          <Button size="small" variant="outlined" onClick={goToCurrentWeek} sx={{ textTransform: 'none' }}>
            Esta semana
          </Button>

          <IconButton size="small" onClick={goToNextWeek} aria-label="Próxima semana">
            <ChevronRightRoundedIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
            Semana de {startFormatted}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setWeeklyPlanOpen(true)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Planejar Semana
        </Button>
      </Stack>

      {/* Week Multi-column Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <Grid container spacing={1.5} columns={{ xs: 1, sm: 2, md: 7 }}>
          {daysList.map((daySummary: DayScheduleSummary) => {
            const dateObj = fromDateKey(daySummary.date);
            const isDayToday = isToday(dateObj);
            const dayEntries = daySummary.entries;

            const dayName = format(dateObj, 'EEE', { locale: ptBR });
            const dayNum = format(dateObj, 'd');

            return (
              <Grid size={{ xs: 1, sm: 1, md: 1 }} key={daySummary.date}>
                <Box
                  sx={(theme) => ({
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: isDayToday
                      ? themePalette(theme).kokyu.background.subtle
                      : themePalette(theme).kokyu.surface.primary,
                    border: `1px solid ${
                      isDayToday
                        ? themePalette(theme).kokyu.action.primary
                        : themePalette(theme).kokyu.border.subtle
                    }`,
                    minHeight: 480,
                    display: 'flex',
                    flexDirection: 'column',
                  })}
                >
                  {/* Column Day Header */}
                  <Box
                    sx={{
                      textAlign: 'center',
                      pb: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'capitalize', fontWeight: 700, display: 'block' }}
                    >
                      {dayName}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: isDayToday ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {dayNum}
                    </Typography>
                  </Box>

                  {/* Day Entries */}
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    {dayEntries.length === 0 ? (
                      <Typography
                        variant="caption"
                        sx={(theme) => ({
                          color: themePalette(theme).kokyu.text.secondary,
                          textAlign: 'center',
                          mt: 4,
                          display: 'block',
                        })}
                      >
                        Livre
                      </Typography>
                    ) : (
                      dayEntries.map((entry: ScheduleEntry) => (
                        <ScheduleEntryCard key={entry.id} entry={entry} compact />
                      ))
                    )}
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}

      <WeeklyPlanningDialog
        open={weeklyPlanOpen}
        onClose={() => setWeeklyPlanOpen(false)}
        onPlanningComplete={refreshWeekly}
      />
    </Box>
  );
}

