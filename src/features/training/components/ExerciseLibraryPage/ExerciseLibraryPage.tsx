'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { KokyuButton, EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { useEquipment } from '../../hooks/useEquipment';
import { useExercises } from '../../hooks/useExercises';
import { exerciseService } from '../../services/exerciseService';
import {
  filterExercises,
  sortExercisesByName,
  type ExerciseFilterOptions,
} from '../../utils/exerciseFilters';
import { ExerciseCard } from '../ExerciseCard/ExerciseCard';
import { ExerciseFiltersBar } from '../ExerciseFiltersBar/ExerciseFiltersBar';
import { ExerciseFormDialog } from '../ExerciseFormDialog/ExerciseFormDialog';

export function ExerciseLibraryPage() {
  const { status, exercises, reload } = useExercises();
  const { equipment } = useEquipment();
  const [filters, setFilters] = useState<ExerciseFilterOptions>({});
  const [isFormOpen, setIsFormOpen] = useState(false);

  const equipmentOptions = useMemo(
    () => equipment.map((item) => ({ value: item.id, label: item.name })),
    [equipment],
  );
  const equipmentNameById = useMemo(
    () => new Map(equipment.map((item) => [item.id, item.name])),
    [equipment],
  );

  const visibleExercises = useMemo(
    () => sortExercisesByName(filterExercises(exercises, filters)),
    [exercises, filters],
  );

  async function handleToggleFavorite(exerciseId: string) {
    await exerciseService.toggleFavoriteExercise(exerciseId);
    reload();
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
            Exercícios
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Busque, filtre e crie exercícios para usar nos seus treinos.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setIsFormOpen(true)}
        >
          Novo exercício
        </KokyuButton>
      </Stack>

      <ExerciseFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        equipmentOptions={equipmentOptions}
      />

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={104} />
          ))}
        </Box>
      ) : status === 'error' ? (
        <Alert severity="error">Não foi possível carregar os exercícios.</Alert>
      ) : visibleExercises.length === 0 ? (
        <EmptyState
          icon={FitnessCenterRoundedIcon}
          title="Nenhum exercício encontrado."
          description="Tente ajustar os filtros ou crie um exercício personalizado."
          action={
            <KokyuButton
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setIsFormOpen(true)}
            >
              Novo exercício
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
          {visibleExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              equipmentNames={exercise.equipmentIds
                .map((id) => equipmentNameById.get(id))
                .filter((name): name is string => Boolean(name))}
              onToggleFavorite={() => handleToggleFavorite(exercise.id)}
            />
          ))}
        </Box>
      )}

      <ExerciseFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={() => reload()}
        equipmentOptions={equipmentOptions}
      />
    </Stack>
  );
}
