'use client';

import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { missionRoutes } from '../../constants/missionRoutes';
import type { Mission } from '../../types';
import { MissionDateInfo } from '../MissionDateInfo/MissionDateInfo';
import { MissionDuration } from '../MissionDuration/MissionDuration';
import { MissionPriorityBadge } from '../MissionPriorityBadge/MissionPriorityBadge';

export interface MissionRowProps {
  mission: Mission;
  projectName?: string;
  blockedByCount?: number;
  onToggleComplete?: (mission: Mission) => void;
}

/** Compact — the primary presentation for volume (spec "LIST VIEW"/"NÃO TRANSFORMAR TODA MISSION EM CARD"). */
export function MissionRow({ mission, projectName, blockedByCount = 0, onToggleComplete }: MissionRowProps) {
  const isCompleted = mission.status === 'completed';
  const isBlocked = mission.status === 'blocked' || blockedByCount > 0;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={(theme) => ({
        alignItems: 'center',
        py: 1,
        px: 1.5,
        borderRadius: 2,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.background.paper,
      })}
    >
      <Checkbox
        checked={isCompleted}
        onChange={() => onToggleComplete?.(mission)}
        slotProps={{ input: { 'aria-label': `Marcar "${mission.title}" como ${isCompleted ? 'não concluída' : 'concluída'}` } }}
      />

      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography
            component={NextLink}
            href={missionRoutes.detail(mission.id)}
            variant="body1"
            sx={(theme) => ({
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? themePalette(theme).kokyu.text.secondary : themePalette(theme).kokyu.text.primary,
              fontWeight: 500,
            })}
          >
            {mission.title}
          </Typography>
          {projectName && (
            <Typography variant="caption" color="text.secondary">
              · {projectName}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <MissionDateInfo mission={mission} />
          <MissionDuration estimatedDuration={mission.estimatedDuration} actualDurationMinutes={mission.actualDurationMinutes} />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
        {isBlocked && (
          <Typography variant="caption" color="error" role="status">
            Bloqueada{blockedByCount > 0 ? ` por ${blockedByCount} missõe${blockedByCount > 1 ? 's' : ''}` : ''}
          </Typography>
        )}
        {mission.status === 'waiting' && (
          <Typography variant="caption" color="text.secondary">
            Aguardando retorno
          </Typography>
        )}
        <MissionPriorityBadge priority={mission.priority} importance={mission.importance} />
      </Stack>
    </Stack>
  );
}
