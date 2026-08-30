'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarViewMonthRoundedIcon from '@mui/icons-material/CalendarViewMonthRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { KokyuButton, EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { trainingRoutes } from '../../constants/trainingRoutes';
import { usePrograms } from '../../hooks/usePrograms';
import { ProgramCard } from '../ProgramCard/ProgramCard';

export function ProgramsPage() {
  const { status, programs } = usePrograms();

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Programas
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Estratégias completas de treinamento — maiores que um treino, com blocos e semanas.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          startIcon={<AddRoundedIcon />}
          component={NextLink}
          href={trainingRoutes.newProgram}
        >
          Novo programa
        </KokyuButton>
      </Stack>

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={100} />
          ))}
        </Box>
      ) : status === 'error' ? (
        <Alert severity="error">Não foi possível carregar seus programas.</Alert>
      ) : programs.length === 0 ? (
        <EmptyState
          icon={CalendarViewMonthRoundedIcon}
          title="Nenhum programa criado ainda."
          description="Um programa organiza várias semanas de treino em blocos, com progressão e deload planejados."
          action={
            <KokyuButton
              variant="contained"
              startIcon={<AddRoundedIcon />}
              component={NextLink}
              href={trainingRoutes.newProgram}
            >
              Novo programa
            </KokyuButton>
          }
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </Box>
      )}
    </Stack>
  );
}
