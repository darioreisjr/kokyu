import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

import { formatMissionDuration } from '../../constants/missionDurationPresets';

export interface MissionDurationProps {
  estimatedDuration?: number;
  actualDurationMinutes?: number;
}

/** `estimatedDuration` never gets silently overwritten — when both exist, both show (spec "PLANNED VS ACTUAL"). */
export function MissionDuration({ estimatedDuration, actualDurationMinutes }: MissionDurationProps) {
  if (!estimatedDuration && !actualDurationMinutes) return null;

  const label =
    actualDurationMinutes !== undefined && estimatedDuration !== undefined
      ? `${formatMissionDuration(actualDurationMinutes)} / ${formatMissionDuration(estimatedDuration)} estimados`
      : formatMissionDuration(actualDurationMinutes ?? estimatedDuration);

  return (
    <Tooltip title={actualDurationMinutes !== undefined ? 'Tempo real / estimado' : 'Duração estimada'}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <ScheduleRoundedIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
