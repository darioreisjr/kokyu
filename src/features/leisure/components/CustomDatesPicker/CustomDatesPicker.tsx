'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickerDay, type PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { ElementType } from 'react';

import { fromDateKey, toDateKey } from '../../utils/dateHelpers';

export interface CustomDatesPickerProps {
  value: string[];
  onChange: (dates: string[]) => void;
  minDate?: Date;
}

interface SelectableDayProps extends PickerDayProps {
  selectedKeys: Set<string>;
}

/**
 * `DateCalendar` only ever tracks one selected day itself — this renders
 * each cell highlighted independently, from `selectedKeys` instead of the
 * calendar's own (unused) `value`. The extra `selectedKeys` prop is threaded
 * in through `slotProps.day`, MUI X's documented way to pass data to a
 * custom day slot; the calendar's own typings don't model that extension,
 * hence the casts in `CustomDatesPicker` below.
 */
function SelectableDay({ selectedKeys, day, ...other }: SelectableDayProps) {
  return <PickerDay {...other} day={day} selected={selectedKeys.has(toDateKey(day))} />;
}

/**
 * A multi-date picker for recurrence: "custom" — every click toggles that
 * date's membership in `value` instead of replacing a single selection.
 * Below the grid, a removable chip per marked date (sorted), the only way
 * to unmark a date without navigating back to its month and clicking it
 * again.
 */
export function CustomDatesPicker({ value, onChange, minDate }: CustomDatesPickerProps) {
  const selectedKeys = new Set(value);
  const sortedValue = [...value].sort();

  function toggleDate(date: Date | null) {
    if (!date) return;
    const key = toDateKey(date);
    onChange(selectedKeys.has(key) ? value.filter((day) => day !== key) : [...value, key].sort());
  }

  return (
    <Stack spacing={1}>
      <Typography variant="labelLarge" component="p">
        Datas
      </Typography>
      <DateCalendar
        value={null}
        onChange={toggleDate}
        minDate={minDate}
        slots={{ day: SelectableDay as unknown as ElementType<PickerDayProps> }}
        slotProps={{ day: { selectedKeys } as never }}
      />
      {sortedValue.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {sortedValue.map((key) => (
            <Chip
              key={key}
              label={format(fromDateKey(key), "d 'de' MMM", { locale: ptBR })}
              onDelete={() => onChange(value.filter((day) => day !== key))}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
