'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import type { GoalCheckIn } from '../../types';
import { formatShortDateTime } from '../../utils/dateHelpers';
import { GoalStatusChip } from '../GoalStatusChip/GoalStatusChip';

export interface GoalCheckInHistoryListProps {
  checkIns: GoalCheckIn[];
}

export function GoalCheckInHistoryList({ checkIns }: GoalCheckInHistoryListProps) {
  if (checkIns.length === 0) return null;

  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge">Check-ins</Typography>
      <Stack spacing={1}>
        {checkIns.map((checkIn) => (
          <Stack
            key={checkIn.id}
            spacing={0.5}
            sx={(theme) => ({
              padding: 1.5,
              borderRadius: 1.5,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            })}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <GoalStatusChip status={checkIn.perceivedStatus} />
              <Typography
                variant="labelSmall"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {formatShortDateTime(checkIn.createdAt)}
              </Typography>
            </Stack>
            {checkIn.whatMovedForward ? (
              <Typography variant="body2">Avançou: {checkIn.whatMovedForward}</Typography>
            ) : null}
            {checkIn.whatIsBlocking ? (
              <Typography variant="body2">Bloqueio: {checkIn.whatIsBlocking}</Typography>
            ) : null}
            {checkIn.nextStep ? (
              <Typography variant="body2">Próximo passo: {checkIn.nextStep}</Typography>
            ) : null}
            {checkIn.note ? <Typography variant="body2">{checkIn.note}</Typography> : null}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
