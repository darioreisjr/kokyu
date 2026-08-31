'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format, isToday as isTodayFns } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fromDateKey } from '@/features/leisure/utils/dateHelpers';
import { themePalette } from '@/design-system/theme/useThemePalette';

export interface DailyRhythmHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onOpenPlanning: () => void;
  onOpenReplan: () => void;
  onOpenFocus: () => void;
  onOpenNewEntry: () => void;
}

export function DailyRhythmHeader({
  selectedDate,
  onDateChange,
  onPreviousDay,
  onNextDay,
  onToday,
  onOpenPlanning,
  onOpenReplan,
  onOpenFocus,
  onOpenNewEntry,
}: DailyRhythmHeaderProps) {
  const currentDate = fromDateKey(selectedDate);
  const isCurrentDayToday = isTodayFns(currentDate);
  const formattedHeading = format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedHeading = formattedHeading.charAt(0).toUpperCase() + formattedHeading.slice(1);

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Top row: Title and CTAs */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Ritmo Diário
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Veja seu dia inteiro e ajuste seu ritmo quando os planos mudarem.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flexWrap: 'wrap', gap: 1 }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoFixHighRoundedIcon />}
            onClick={onOpenReplan}
            sx={{ textTransform: 'none' }}
          >
            Reorganizar restante
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<CenterFocusStrongRoundedIcon />}
            onClick={onOpenFocus}
            sx={{ textTransform: 'none' }}
          >
            Focar agora
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<ScheduleRoundedIcon />}
            onClick={onOpenPlanning}
            sx={{ textTransform: 'none' }}
          >
            Planejar meu dia
          </Button>

          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={onOpenNewEntry}
            sx={{ textTransform: 'none' }}
          >
            Adicionar
          </Button>
        </Stack>
      </Stack>

      {/* Date navigation bar */}
      <Stack
        direction="row"
        sx={(theme) => ({
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          borderRadius: 2,
          backgroundColor: themePalette(theme).kokyu.surface.primary,
          border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        })}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            aria-label="Dia anterior"
            onClick={onPreviousDay}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>

          <Button
            size="small"
            variant={isCurrentDayToday ? 'contained' : 'outlined'}
            color={isCurrentDayToday ? 'primary' : 'inherit'}
            onClick={onToday}
            sx={{ textTransform: 'none', px: 2, fontWeight: 600 }}
          >
            Hoje
          </Button>

          <IconButton
            size="small"
            aria-label="Próximo dia"
            onClick={onNextDay}
          >
            <ChevronRightRoundedIcon />
          </IconButton>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, ml: 1, display: { xs: 'none', sm: 'inline-block' } }}
          >
            {capitalizedHeading}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            size="small"
            variant="text"
            startIcon={<EventRoundedIcon />}
            onClick={() => setDatePickerOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            {format(currentDate, 'dd/MM/yyyy')}
          </Button>

          {/* Hidden DatePicker triggered on click */}
          <Box sx={{ display: 'none' }}>
            <DatePicker
              open={datePickerOpen}
              onClose={() => setDatePickerOpen(false)}
              value={currentDate}
              onChange={(newVal) => {
                if (newVal) {
                  onDateChange(format(newVal, 'yyyy-MM-dd'));
                }
                setDatePickerOpen(false);
              }}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

