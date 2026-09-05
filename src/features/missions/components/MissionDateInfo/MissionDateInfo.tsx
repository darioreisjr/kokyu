import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { isMissionOverdue } from '../../utils/missionDateStatus';
import { fromDateKey, todayKey } from '../../utils/missionDateKey';
import type { Mission } from '../../types';

export interface MissionDateInfoProps {
  mission: Pick<Mission, 'availableFrom' | 'plannedDate' | 'deadline' | 'status' | 'cancelledAt' | 'completedAt' | 'archivedAt'>;
}

function formatShort(dateKey: string): string {
  return format(fromDateKey(dateKey), "d 'de' MMM", { locale: ptBR });
}

/** Never collapses availableFrom/plannedDate/deadline into one field — spec "DATAS - REGRA OBRIGATÓRIA". */
export function MissionDateInfo({ mission }: MissionDateInfoProps) {
  const today = todayKey();
  const overdue = isMissionOverdue(mission as Mission, today);

  if (!mission.availableFrom && !mission.plannedDate && !mission.deadline) return null;

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {mission.availableFrom && mission.availableFrom > today && (
        <Chip
          size="small"
          variant="outlined"
          icon={<EventBusyRoundedIcon fontSize="small" />}
          label={`Disponível em ${formatShort(mission.availableFrom)}`}
        />
      )}
      {mission.plannedDate && (
        <Chip
          size="small"
          variant="outlined"
          icon={<CalendarTodayRoundedIcon fontSize="small" />}
          label={`Planejada: ${formatShort(mission.plannedDate)}`}
        />
      )}
      {mission.deadline && (
        <Chip
          size="small"
          color={overdue ? 'error' : 'default'}
          variant={overdue ? 'filled' : 'outlined'}
          icon={<HourglassBottomRoundedIcon fontSize="small" />}
          label={overdue ? `Atrasada · prazo ${formatShort(mission.deadline)}` : `Prazo: ${formatShort(mission.deadline)}`}
        />
      )}
    </Stack>
  );
}
