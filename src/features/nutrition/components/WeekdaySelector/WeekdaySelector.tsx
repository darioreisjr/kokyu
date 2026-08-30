'use client';

import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { isSameDay, isToday, toDateKey } from '../../utils/dateHelpers';

export interface WeekdaySelectorProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

/** Mobile Planejamento's own day picker — a horizontal row of weekday abbreviations for the current week, never a 7-column desktop calendar squeezed down. */
export function WeekdaySelector({ weekDays, selectedDate, onSelect }: WeekdaySelectorProps) {
  return (
    <ToggleButtonGroup
      value={toDateKey(selectedDate)}
      exclusive
      onChange={(_event, next: string | null) => {
        const match = weekDays.find((day) => toDateKey(day) === next);
        if (match) onSelect(match);
      }}
      aria-label="Selecionar dia da semana"
      sx={{
        width: '100%',
        overflowX: 'auto',
        '& .MuiToggleButtonGroup-grouped': { border: '1px solid', borderRadius: '8px !important' },
      }}
    >
      {weekDays.map((day) => (
        <ToggleButton
          key={toDateKey(day)}
          value={toDateKey(day)}
          sx={{ flex: 1, textTransform: 'none', paddingBlock: 1 }}
        >
          <Stack spacing={0.25} sx={{ alignItems: 'center' }}>
            <span>{format(day, 'EEEEEE', { locale: ptBR })}</span>
            <span style={{ fontWeight: isToday(day) || isSameDay(day, selectedDate) ? 700 : 400 }}>
              {format(day, 'd')}
            </span>
          </Stack>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
