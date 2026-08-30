'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { useRecoveryOverview } from '../../hooks/useRecoveryOverview';
import { MuscleRecoveryCard } from '../MuscleRecoveryCard/MuscleRecoveryCard';
import { RecoveryCheckInDialog } from '../RecoveryCheckInDialog/RecoveryCheckInDialog';

export function RecoveryPage() {
  const { status, estimates, reload } = useRecoveryOverview();
  const [checkInOpen, setCheckInOpen] = useState(false);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Recuperação
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Uma estimativa baseada no seu histórico e em como você diz que está se sentindo — não um
            diagnóstico.
          </Typography>
        </Stack>
        <KokyuButton variant="outlined" onClick={() => setCheckInOpen(true)}>
          Check-in de recuperação
        </KokyuButton>
      </Stack>

      <Alert severity="info" variant="outlined">
        Isto é uma estimativa de bem-estar, não uma avaliação médica. Se algo doer de forma
        persistente, procure orientação profissional.
      </Alert>

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={80} />
          ))}
        </Box>
      ) : status === 'error' ? (
        <Alert severity="error">Não foi possível carregar a recuperação.</Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          {estimates.map((estimate) => (
            <MuscleRecoveryCard key={estimate.muscleGroup} estimate={estimate} />
          ))}
        </Box>
      )}

      <RecoveryCheckInDialog
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onSubmitted={reload}
      />
    </Stack>
  );
}
