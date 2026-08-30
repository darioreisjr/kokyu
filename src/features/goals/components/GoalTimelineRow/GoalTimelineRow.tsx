'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { goalRoutes } from '../../constants/goalRoutes';
import type { Goal } from '../../types';
import { fromDateKey, formatShortDate } from '../../utils/dateHelpers';
import { getGoalTimelineFraction } from '../../utils/goalHorizon';

export interface GoalTimelineRowProps {
  goal: Goal;
}

/**
 * Desktop-only simplified timeline for `/app/metas/planejamento` — start, deadline and milestones
 * along one track. Deliberately not a full Gantt chart (see the spec's own "não construir Gantt
 * corporativo complexo").
 */
export function GoalTimelineRow({ goal }: GoalTimelineRowProps) {
  const fraction = getGoalTimelineFraction(goal);
  const start = fromDateKey(goal.startDate).getTime();
  const target = goal.targetDate ? fromDateKey(goal.targetDate).getTime() : undefined;

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography
          component={NextLink}
          href={goalRoutes.detail(goal.id)}
          variant="labelMedium"
          sx={{ color: 'inherit', textDecoration: 'none' }}
        >
          {goal.title}
        </Typography>
        <Typography
          variant="labelSmall"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {formatShortDate(goal.startDate)} —{' '}
          {goal.targetDate ? formatShortDate(goal.targetDate) : 'sem prazo'}
        </Typography>
      </Stack>
      <Box
        sx={(theme) => ({
          position: 'relative',
          height: 8,
          borderRadius: 999,
          backgroundColor: themePalette(theme).kokyu.background.subtle,
        })}
      >
        {fraction !== null ? (
          <Box
            sx={(theme) => ({
              position: 'absolute',
              inset: 0,
              width: `${Math.round(fraction * 100)}%`,
              borderRadius: 999,
              backgroundColor: themePalette(theme).kokyu.action.primary,
            })}
          />
        ) : null}
        {target
          ? (goal.milestones ?? []).map((milestone) => {
              if (!milestone.targetDate) return null;
              const milestoneTime = fromDateKey(milestone.targetDate).getTime();
              const positionPercent =
                target === start
                  ? 100
                  : Math.max(0, Math.min(100, ((milestoneTime - start) / (target - start)) * 100));
              return (
                <Tooltip key={milestone.id} title={milestone.title}>
                  <Box
                    sx={(theme) => ({
                      position: 'absolute',
                      top: '50%',
                      left: `${positionPercent}%`,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: milestone.completed
                        ? themePalette(theme).kokyu.feedback.success
                        : themePalette(theme).kokyu.surface.primary,
                      border: `2px solid ${themePalette(theme).kokyu.action.primary}`,
                    })}
                  />
                </Tooltip>
              );
            })
          : null}
      </Box>
    </Stack>
  );
}
