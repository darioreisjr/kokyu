'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { useHabits } from '../../hooks/useHabits';
import { deriveHabitOccurrencesForDate } from '../../services/engines/habitOccurrenceService';
import { calculateDailyHabitScore } from '../../services/engines/habitProgressEngine';
import { HabitAreaIcon } from '../HabitAreaIcon/HabitAreaIcon';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function HabitCalendarPage() {
  const { habits } = useHabits();
  const todayStr = new Date().toISOString().split('T')[0]!;
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const daysInMonth = useMemo(() => {
    const days: { date: string; dayNumber: number; isCurrentMonth: boolean }[] = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Padding for week start (Monday = 1)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth, -i);
      days.push({
        date: d.toISOString().split('T')[0]!,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({
        date: d.toISOString().split('T')[0]!,
        dayNumber: i,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const selectedDayOccurrences = useMemo(() => {
    return deriveHabitOccurrencesForDate(habits, selectedDate, [], todayStr);
  }, [habits, selectedDate, todayStr]);

  const selectedDayScore = useMemo(() => {
    return calculateDailyHabitScore(habits, selectedDate, [], todayStr);
  }, [habits, selectedDate, todayStr]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Calendário de Hábitos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visão temporal detalhada e histórico de cada dia do mês.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Calendar Grid */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
              <CardContent>
                <Stack spacing={2.5}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </Typography>

                    <Stack direction="row" spacing={0.5}>
                      <IconButton onClick={handlePrevMonth} aria-label="Mês anterior" size="small">
                        <ArrowBackIosNewRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={handleNextMonth} aria-label="Próximo mês" size="small">
                        <ArrowForwardIosRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Grid container spacing={1} columns={7}>
                    {WEEKDAY_NAMES.map((name) => (
                      <Grid key={name} size={1} sx={{ textAlign: 'center', py: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {name}
                        </Typography>
                      </Grid>
                    ))}

                    {daysInMonth.map((day) => {
                      const isSelected = day.date === selectedDate;
                      const isToday = day.date === todayStr;

                      return (
                        <Grid key={day.date} size={1}>
                          <Box
                            onClick={() => setSelectedDate(day.date)}
                            sx={(theme) => ({
                              height: 64,
                              borderRadius: 2,
                              p: 0.8,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              border: `1px solid ${isSelected ? themePalette(theme).kokyu.action.primary : isToday ? themePalette(theme).kokyu.border.focus : themePalette(theme).kokyu.border.subtle}`,
                              backgroundColor: isSelected
                                ? themePalette(theme).kokyu.surface.secondary
                                : day.isCurrentMonth
                                  ? themePalette(theme).kokyu.background.paper
                                  : themePalette(theme).kokyu.surface.secondary,
                              opacity: day.isCurrentMonth ? 1 : 0.4,
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                borderColor: themePalette(theme).kokyu.border.strong,
                              },
                            })}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: isToday ? 700 : 500,
                                color: isToday ? 'primary.main' : 'text.primary',
                              }}
                            >
                              {day.dayNumber}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Day Detail Sidebar */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Stack spacing={0.5}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{selectedDate}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Score do dia: {selectedDayScore.scorePercent}%
                    </Typography>
                  </Stack>

                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Hábitos do dia ({selectedDayOccurrences.length}):
                  </Typography>

                  <Stack spacing={1.5}>
                    {selectedDayOccurrences.map((occ) => (
                      <Box
                        key={occ.habitId}
                        sx={(theme) => ({
                          p: 1.5,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          backgroundColor: themePalette(theme).kokyu.surface.secondary,
                        })}
                      >
                        <HabitAreaIcon area={occ.habit.area} size="small" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {occ.habit.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {occ.status === 'completed'
                              ? 'Concluído'
                              : occ.status === 'skipped'
                                ? 'Pulo neutro'
                                : occ.isPaused
                                  ? 'Em pausa'
                                  : 'Pendente'}
                          </Typography>
                        </Box>
                        <Chip
                          label={occ.status}
                          size="small"
                          color={occ.status === 'completed' ? 'primary' : 'default'}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
