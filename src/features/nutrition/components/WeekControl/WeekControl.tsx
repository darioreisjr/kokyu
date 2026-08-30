'use client';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { addWeeks } from 'date-fns';

import { KokyuButton } from '@/design-system/components';

import { formatWeekRangeHeading, getWeekStart } from '../../utils/dateHelpers';

export interface WeekControlProps {
  weekStart: Date;
  weekStartsOn: 0 | 1;
  onChange: (weekStart: Date) => void;
}

/** `<` "Hoje" `>` for the week, respecting Settings → "A semana começa em" — never a second, independent week convention. */
export function WeekControl({ weekStart, weekStartsOn, onChange }: WeekControlProps) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <IconButton
          aria-label="Semana anterior"
          size="small"
          onClick={() => onChange(addWeeks(weekStart, -1))}
        >
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>
        <KokyuButton
          variant="text"
          size="small"
          onClick={() => onChange(getWeekStart(new Date(), weekStartsOn))}
        >
          Hoje
        </KokyuButton>
        <IconButton
          aria-label="Próxima semana"
          size="small"
          onClick={() => onChange(addWeeks(weekStart, 1))}
        >
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Typography variant="h4" component="h2">
        {formatWeekRangeHeading(weekStart)}
      </Typography>
    </Stack>
  );
}
