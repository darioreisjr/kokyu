'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { missionRoutes } from '../../constants/missionRoutes';
import type { Mission } from '../../types';
import { MissionDateInfo } from '../MissionDateInfo/MissionDateInfo';
import { MissionDuration } from '../MissionDuration/MissionDuration';
import { MissionPriorityBadge } from '../MissionPriorityBadge/MissionPriorityBadge';

export interface MissionCardProps {
  mission: Mission;
  projectName?: string;
  goalLabel?: string;
  dependenciesCount?: number;
}

/** Used only where a view justifies a card (Board/Eisenhower) — spec "NÃO TRANSFORMAR TODA MISSION EM CARD". */
export function MissionCard({ mission, projectName, goalLabel, dependenciesCount }: MissionCardProps) {
  return (
    <Card
      variant="outlined"
      sx={(theme) => ({ borderRadius: 2, borderColor: themePalette(theme).kokyu.border.default })}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
          <Typography
            component={NextLink}
            href={missionRoutes.detail(mission.id)}
            variant="subtitle2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.primary, textDecoration: 'none', fontWeight: 600 })}
          >
            {mission.title}
          </Typography>

          {(projectName || goalLabel) && (
            <Typography variant="caption" color="text.secondary">
              {[projectName, goalLabel && `Meta: ${goalLabel}`].filter(Boolean).join(' · ')}
            </Typography>
          )}

          <MissionDateInfo mission={mission} />

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <MissionPriorityBadge priority={mission.priority} importance={mission.importance} />
            <MissionDuration estimatedDuration={mission.estimatedDuration} actualDurationMinutes={mission.actualDurationMinutes} />
            {!!dependenciesCount && (
              <Typography variant="caption" color="error">
                Bloqueada por {dependenciesCount}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
