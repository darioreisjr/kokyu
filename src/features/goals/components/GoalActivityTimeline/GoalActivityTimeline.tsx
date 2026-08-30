'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import type { GoalActivity } from '../../types';
import { formatShortDateTime } from '../../utils/dateHelpers';

export interface GoalActivityTimelineProps {
  activities: GoalActivity[];
}

export function GoalActivityTimeline({ activities }: GoalActivityTimelineProps) {
  if (activities.length === 0) return null;

  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge">Histórico</Typography>
      <Stack
        spacing={1}
        sx={(theme) => ({
          borderLeft: `2px solid ${themePalette(theme).kokyu.border.subtle}`,
          paddingLeft: 2,
        })}
      >
        {activities.map((activity) => (
          <Stack key={activity.id} spacing={0.1}>
            <Typography variant="body2">{activity.description}</Typography>
            <Typography
              variant="labelSmall"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {formatShortDateTime(activity.createdAt)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
