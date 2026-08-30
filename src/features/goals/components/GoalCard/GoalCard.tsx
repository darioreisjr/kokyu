'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { getGoalAreaDefinition } from '../../constants/goalAreas';
import { goalRoutes } from '../../constants/goalRoutes';
import type { GoalProgressResult } from '../../services/progressStrategies';
import type { Goal } from '../../types';
import { formatShortDateTime } from '../../utils/dateHelpers';
import { formatGoalDeadline } from '../../utils/goalFormatting';
import { getGoalProgressCaption } from '../../utils/goalProgressCaption';
import { GoalAreaIcon } from '../GoalAreaIcon/GoalAreaIcon';
import { GoalProgressBar } from '../GoalProgressBar/GoalProgressBar';
import { GoalStatusChip } from '../GoalStatusChip/GoalStatusChip';

export interface GoalCardProps {
  goal: Goal;
  progress: GoalProgressResult;
}

/**
 * One card shape for every list (Visão geral, Em andamento, Planejamento, Concluídas) — título,
 * área, progresso, status, prazo, próximo marco, última atualização e a origem
 * manual/automática. Never computes progress itself (see `useGoalsProgressMap`) — it only renders
 * the already-resolved `GoalProgressResult`.
 */
export function GoalCard({ goal, progress }: GoalCardProps) {
  const area = getGoalAreaDefinition(goal.area);
  const nextMilestone = [...(goal.milestones ?? [])]
    .filter((milestone) => !milestone.completed)
    .sort((a, b) => a.order - b.order)[0];
  const caption = getGoalProgressCaption(goal, progress);
  const unit =
    goal.measurement.type === 'numeric' ||
    goal.measurement.type === 'consistency' ||
    goal.measurement.type === 'average'
      ? goal.measurement.unit
      : 'units';

  return (
    <Box
      component={NextLink}
      href={goalRoutes.detail(goal.id)}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        padding: 2,
        textDecoration: 'none',
        color: 'inherit',
      })}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
          <GoalAreaIcon
            area={goal.area}
            fontSize="small"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, flexShrink: 0 })}
          />
          <Typography variant="labelLarge" component="p" noWrap>
            {goal.title}
          </Typography>
        </Stack>
        <GoalStatusChip status={goal.status} />
      </Stack>

      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {area.label}
      </Typography>

      <GoalProgressBar
        current={progress.current}
        target={progress.target}
        percent={progress.percent}
        unit={unit}
        label={caption}
      />

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
        <Typography
          variant="labelSmall"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {formatGoalDeadline(goal.targetDate)}
        </Typography>
        {nextMilestone ? (
          <Typography
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            noWrap
          >
            Próximo: {nextMilestone.title}
          </Typography>
        ) : null}
        <Typography
          variant="labelSmall"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {goal.progressMode === 'automatic' ? 'Atualização automática' : 'Atualização manual'}
        </Typography>
        <Typography
          variant="labelSmall"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Atualizado em {formatShortDateTime(goal.updatedAt)}
        </Typography>
      </Stack>
    </Box>
  );
}
