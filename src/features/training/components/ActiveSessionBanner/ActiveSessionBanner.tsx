'use client';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { trainingRoutes } from '../../constants/trainingRoutes';
import { useTrainingSession } from '../../providers/TrainingSessionProvider';

/** Shown on Hoje whenever a workout is in progress — this is the "recover after refresh" entry point. */
export function ActiveSessionBanner() {
  const { activeSession, isHydrated } = useTrainingSession();

  if (!isHydrated || !activeSession) return null;

  return (
    <Box
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.action.primary}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        padding: 2,
      })}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 1 }}
      >
        <Stack spacing={0.25}>
          <Typography
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Treino em andamento
          </Typography>
          <Typography variant="labelLarge">{activeSession.name}</Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          startIcon={<PlayArrowRoundedIcon />}
          component={NextLink}
          href={trainingRoutes.session(activeSession.sessionId)}
        >
          Continuar treino
        </KokyuButton>
      </Stack>
    </Box>
  );
}
