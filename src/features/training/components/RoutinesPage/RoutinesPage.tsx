'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useMemo, useState } from 'react';

import { KokyuButton, EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { trainingRoutes } from '../../constants/trainingRoutes';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useRoutines } from '../../hooks/useRoutines';
import { useTrainingLocations } from '../../hooks/useTrainingLocations';
import { routineService } from '../../services/routineService';
import { filterRoutines, type RoutineFilterOptions } from '../../utils/routineFilters';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { RoutineCard } from '../RoutineCard/RoutineCard';
import { RoutineFiltersBar } from '../RoutineFiltersBar/RoutineFiltersBar';

export function RoutinesPage() {
  const { status, routines, reload } = useRoutines();
  const { locations } = useTrainingLocations();
  const [filters, setFilters] = useState<RoutineFilterOptions>({});
  const confirmAction = useConfirmAction();

  const locationOptions = useMemo(
    () => locations.map((location) => ({ value: location.id, label: location.name })),
    [locations],
  );
  const visibleRoutines = useMemo(() => filterRoutines(routines, filters), [routines, filters]);

  async function handleToggleFavorite(routineId: string) {
    await routineService.toggleFavoriteRoutine(routineId);
    reload();
  }

  async function handleDuplicate(routineId: string) {
    await routineService.duplicateRoutine(routineId);
    reload();
  }

  function handleArchive(routineId: string, name: string) {
    confirmAction.request({
      title: 'Arquivar treino',
      description: `"${name}" será movido para os treinos arquivados. Você pode acessá-lo depois filtrando por arquivados.`,
      confirmLabel: 'Arquivar',
      onConfirm: async () => {
        await routineService.archiveRoutine(routineId);
        reload();
      },
    });
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Meus treinos
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Suas rotinas reutilizáveis — modelos, não sessões executadas.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          startIcon={<AddRoundedIcon />}
          component={NextLink}
          href={trainingRoutes.newRoutine}
        >
          Novo treino
        </KokyuButton>
      </Stack>

      <RoutineFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        locationOptions={locationOptions}
      />

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={120} />
          ))}
        </Box>
      ) : status === 'error' ? (
        <Alert severity="error">Não foi possível carregar seus treinos.</Alert>
      ) : visibleRoutines.length === 0 ? (
        <EmptyState
          icon={FitnessCenterRoundedIcon}
          title="Nenhum treino encontrado."
          description="Crie um treino novo ou ajuste os filtros."
          action={
            <KokyuButton
              variant="contained"
              startIcon={<AddRoundedIcon />}
              component={NextLink}
              href={trainingRoutes.newRoutine}
            >
              Novo treino
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
          {visibleRoutines.map((routine) => (
            <Stack key={routine.id} spacing={1}>
              <RoutineCard
                routine={routine}
                onToggleFavorite={() => handleToggleFavorite(routine.id)}
              />
              <Stack direction="row" spacing={1}>
                <KokyuButton
                  size="small"
                  variant="text"
                  onClick={() => handleDuplicate(routine.id)}
                >
                  Duplicar
                </KokyuButton>
                {!routine.archived ? (
                  <KokyuButton
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() => handleArchive(routine.id, routine.name)}
                  >
                    Arquivar
                  </KokyuButton>
                ) : null}
              </Stack>
            </Stack>
          ))}
        </Box>
      )}

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
