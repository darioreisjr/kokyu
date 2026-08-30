'use client';

import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import type { PerformedSet, WorkoutSession } from '../../types';
import { formatDurationMinutes } from '../../utils/trainingFormatting';
import { formatWeight } from '../../utils/weightUnit';

export interface SessionSummaryCardProps {
  session: WorkoutSession;
  performedSets: PerformedSet[];
  weightUnit: 'kg' | 'lb';
  onOpen: () => void;
}

export function SessionSummaryCard({
  session,
  performedSets,
  weightUnit,
  onOpen,
}: SessionSummaryCardProps) {
  const workingSets = performedSets.filter((set) => set.completed && set.setType !== 'warmup');
  const volumeKg = workingSets.reduce(
    (total, set) => total + (set.weightKg ?? 0) * (set.reps ?? 0),
    0,
  );
  const prCount = session.newPersonalRecordIds?.length ?? 0;

  return (
    <Box
      component={ButtonBase}
      onClick={onOpen}
      sx={(theme) => ({
        display: 'flex',
        textAlign: 'left',
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        padding: 2,
      })}
    >
      <Stack spacing={0.5} sx={{ width: '100%' }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="labelLarge">{session.name}</Typography>
          <Typography
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {new Date(session.startedAt).toLocaleDateString('pt-BR')}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {session.durationSeconds ? formatDurationMinutes(session.durationSeconds) : '—'} ·{' '}
          {workingSets.length} séries · {formatWeight(volumeKg, weightUnit)}
        </Typography>
        {prCount > 0 ? (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <EmojiEventsRoundedIcon fontSize="small" color="warning" aria-hidden="true" />
            <Typography variant="labelSmall">
              {prCount} {prCount === 1 ? 'novo recorde' : 'novos recordes'}
            </Typography>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
