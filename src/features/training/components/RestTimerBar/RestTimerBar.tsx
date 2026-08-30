'use client';

import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { useRestTimer } from '../../hooks/useRestTimer';
import { formatSecondsClock } from '../../utils/trainingFormatting';

export interface RestTimerBarProps {
  restEndAt: string | undefined;
  onAddSeconds: (seconds: number) => void;
  onSkip: () => void;
}

/** Sticky, compact — never a full-screen takeover. Announces only "Descanso concluído" once, not every tick (per the spec's own timer-accessibility rule). */
export function RestTimerBar({ restEndAt, onAddSeconds, onSkip }: RestTimerBarProps) {
  const { remainingSeconds, isResting } = useRestTimer(restEndAt);
  const wasResting = useRef(isResting);
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wasResting.current && !isResting && announcementRef.current) {
      announcementRef.current.textContent = 'Descanso concluído.';
    }
    wasResting.current = isResting;
  }, [isResting]);

  if (!restEndAt || !isResting) {
    return (
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}
      />
    );
  }

  return (
    <Box
      sx={(theme) => ({
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
        borderRadius: 2,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        padding: 1.5,
        boxShadow: 4,
      })}
    >
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}
      />
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography
            variant="displaySmall"
            component="p"
            aria-label={`Descanso: ${formatSecondsClock(remainingSeconds)} restantes`}
          >
            {formatSecondsClock(remainingSeconds)}
          </Typography>
          <Typography
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Descanso
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <KokyuButton size="small" variant="outlined" onClick={() => onAddSeconds(-15)}>
            -15s
          </KokyuButton>
          <KokyuButton size="small" variant="outlined" onClick={() => onAddSeconds(15)}>
            +15s
          </KokyuButton>
          <IconButton size="small" aria-label="Pular descanso" onClick={onSkip}>
            <PauseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
