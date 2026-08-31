'use client';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { fromDateKey } from '@/features/leisure/utils/dateHelpers';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { useMonthlyRhythm } from '../../hooks/useMonthlyRhythm';
import { ScheduleEntryCard } from '../ScheduleEntryCard/ScheduleEntryCard';

export function MonthlyCalendarView() {
  const { preferences } = usePreferences();
  const weekStartsOn = preferences.locale.weekStartsOn;

  const {
    currentMonth,
    selectedDay,
    setSelectedDay,
    selectedDayEntries,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useMonthlyRhythm();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn });

  const allCalendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const formattedMonthTitle = format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedMonthTitle =
    formattedMonthTitle.charAt(0).toUpperCase() + formattedMonthTitle.slice(1);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Month Header */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton size="small" onClick={goToPreviousMonth} aria-label="Mês anterior">
            <ChevronLeftRoundedIcon />
          </IconButton>

          <Button size="small" variant="outlined" onClick={goToCurrentMonth} sx={{ textTransform: 'none' }}>
            Este mês
          </Button>

          <IconButton size="small" onClick={goToNextMonth} aria-label="Próximo mês">
            <ChevronRightRoundedIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
            {capitalizedMonthTitle}
          </Typography>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Calendar Grid */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Box
            sx={(theme) => ({
              p: 2,
              borderRadius: 2,
              backgroundColor: themePalette(theme).kokyu.surface.primary,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            })}
          >
            {/* Weekday headers */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                textAlign: 'center',
                mb: 1.5,
              }}
            >
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, idx) => {
                const adjustedName =
                  weekStartsOn === 1
                    ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][idx]
                    : dayName;
                return (
                  <Typography
                    key={idx}
                    variant="caption"
                    sx={(theme) => ({
                      color: themePalette(theme).kokyu.text.secondary,
                      fontWeight: 700,
                    })}
                  >
                    {adjustedName}
                  </Typography>
                );
              })}
            </Box>

            {/* Days grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 1,
              }}
            >
              {allCalendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const isSelected = dateKey === selectedDay;
                const inCurrentMonth = isSameMonth(day, currentMonth);
                const isDayToday = isToday(day);

                return (
                  <Box
                    key={dateKey}
                    onClick={() => setSelectedDay(dateKey)}
                    sx={(theme) => {
                      const palette = themePalette(theme);
                      return {
                        minHeight: 52,
                        p: 1,
                        borderRadius: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: isSelected
                          ? palette.kokyu.action.primary
                          : isDayToday
                            ? palette.kokyu.background.subtle
                            : 'transparent',
                        color: isSelected
                          ? palette.kokyu.action.primaryContrast
                          : inCurrentMonth
                            ? palette.kokyu.text.primary
                            : palette.kokyu.text.disabled,
                        border: isSelected
                          ? `1px solid ${palette.kokyu.action.primary}`
                          : `1px solid ${palette.kokyu.border.subtle}`,
                        transition: 'all 0.15s ease-in-out',
                        '&:hover': {
                          borderColor: palette.kokyu.action.primary,
                        },
                      };
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: isSelected || isDayToday ? 700 : 500 }}>
                      {format(day, 'd')}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Grid>

        {/* Selected Day Schedule Panel */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Box
            sx={(theme) => ({
              p: 2,
              borderRadius: 2,
              backgroundColor: themePalette(theme).kokyu.surface.primary,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            })}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Agenda de {format(fromDateKey(selectedDay), "d 'de' MMMM", { locale: ptBR })}
            </Typography>

            {selectedDayEntries.length === 0 ? (
              <Typography
                variant="caption"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, py: 3, textAlign: 'center', display: 'block' })}
              >
                Nenhuma atividade agendada para esta data.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {selectedDayEntries.map((entry) => (
                  <ScheduleEntryCard key={entry.id} entry={entry} compact />
                ))}
              </Stack>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

