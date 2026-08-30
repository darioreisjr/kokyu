'use client';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { addDays } from 'date-fns';

import { KokyuButton, KokyuDateField } from '@/design-system/components';

import { formatDateHeading } from '../../utils/dateHelpers';

export interface DateSelectorProps {
  date: Date;
  onChange: (date: Date) => void;
}

/**
 * `<` "Hoje" `>` plus a real calendar field for jumping to any date —
 * the heading text (e.g. "Sábado, 29 de agosto") always reflects
 * `date`, so both paths to changing it stay in sync.
 */
export function DateSelector({ date, onChange }: DateSelectorProps) {
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}
      >
        <IconButton
          aria-label="Dia anterior"
          size="small"
          onClick={() => onChange(addDays(date, -1))}
        >
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>
        <KokyuButton variant="text" size="small" onClick={() => onChange(new Date())}>
          Hoje
        </KokyuButton>
        <IconButton
          aria-label="Próximo dia"
          size="small"
          onClick={() => onChange(addDays(date, 1))}
        >
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 8 }} />
        <KokyuDateField
          label="Escolher data"
          value={date}
          onChange={(value) => value && onChange(value)}
        />
      </Stack>
      <Typography variant="h4" component="h2">
        {formatDateHeading(date)}
      </Typography>
    </Stack>
  );
}
