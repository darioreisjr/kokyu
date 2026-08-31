'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PlaylistPlayRoundedIcon from '@mui/icons-material/PlaylistPlayRounded';
import NextLink from 'next/link';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { habitRoutes } from '../../constants/habitRoutes';
import { useHabits } from '../../hooks/useHabits';
import { useRoutines } from '../../hooks/useRoutines';
import { RoutineCard } from '../RoutineCard/RoutineCard';

export function RoutinesPage() {
  const { routines, isLoading: routinesLoading } = useRoutines();
  const { habits, isLoading: habitsLoading } = useHabits();

  const isLoading = routinesLoading || habitsLoading;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Rotinas & Habit Stacking
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Agrupe hábitos em sequências naturais e execute-os com foco total no modo Player.
            </Typography>
          </Stack>

          <KokyuButton
            component={NextLink}
            href={habitRoutes.routineNew}
            variant="contained"
            startIcon={<AddRoundedIcon />}
          >
            Nova rotina
          </KokyuButton>
        </Stack>

        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : routines.length === 0 ? (
          <EmptyState
            icon={PlaylistPlayRoundedIcon}
            title="Nenhuma rotina criada"
            description="Crie sequências de hábitos para a manhã, tarde ou noite e execute-as passo a passo."
            action={
              <KokyuButton
                component={NextLink}
                href={habitRoutes.routineNew}
                variant="contained"
              >
                Criar primeira rotina
              </KokyuButton>
            }
          />
        ) : (
          <Grid container spacing={3}>
            {routines.map((routine) => (
              <Grid key={routine.id} size={{ xs: 12, md: 6 }}>
                <RoutineCard routine={routine} habits={habits} />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
