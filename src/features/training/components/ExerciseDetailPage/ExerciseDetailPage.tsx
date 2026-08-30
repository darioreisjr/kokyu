'use client';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { exercisePreferenceOptions, exerciseTypeLabels } from '../../constants/exerciseCategories';
import { muscleGroupLabels } from '../../constants/muscleGroups';
import { personalRecordTypeLabels } from '../../constants/personalRecordLabels';
import { trainingRoutes } from '../../constants/trainingRoutes';
import { useEquipment } from '../../hooks/useEquipment';
import { useExercise } from '../../hooks/useExercise';
import { useExerciseHistory } from '../../hooks/useExerciseHistory';
import { usePersonalRecords } from '../../hooks/usePersonalRecords';
import { exerciseService } from '../../services/exerciseService';
import type { ExercisePreference } from '../../types';
import { formatWeight } from '../../utils/weightUnit';

export interface ExerciseDetailPageProps {
  exerciseId: string;
}

export function ExerciseDetailPage({ exerciseId }: ExerciseDetailPageProps) {
  const { status, exercise, reload } = useExercise(exerciseId);
  const { equipment } = useEquipment();
  const { history } = useExerciseHistory(exerciseId);
  const { records } = usePersonalRecords(exerciseId);

  if (status === 'loading') {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width={240} height={40} />
        <Skeleton variant="rounded" height={120} />
      </Stack>
    );
  }

  if (status === 'error' || !exercise) {
    return (
      <EmptyState
        title="Exercício não encontrado."
        description="Ele pode ter sido removido."
        action={
          <Typography component={NextLink} href={trainingRoutes.exercises} variant="labelLarge">
            Voltar para Exercícios
          </Typography>
        }
      />
    );
  }

  const equipmentNames = exercise.equipmentIds
    .map((id) => equipment.find((item) => item.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  async function handleToggleFavorite() {
    await exerciseService.toggleFavoriteExercise(exerciseId);
    reload();
  }

  async function handlePreferenceChange(preference: ExercisePreference) {
    await exerciseService.updateExercisePreference(exerciseId, preference);
    reload();
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton
          component={NextLink}
          href={trainingRoutes.exercises}
          aria-label="Voltar para Exercícios"
          size="small"
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="displaySmall" component="h1" sx={{ flexGrow: 1 }}>
          {exercise.name}
        </Typography>
        <IconButton
          aria-label={exercise.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={handleToggleFavorite}
        >
          {exercise.favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <Chip label={exerciseTypeLabels[exercise.exerciseType]} size="small" />
        {exercise.primaryMuscles.map((muscle) => (
          <Chip key={muscle} label={muscleGroupLabels[muscle]} size="small" />
        ))}
        {equipmentNames.map((name) => (
          <Chip key={name} label={name} size="small" variant="outlined" />
        ))}
      </Stack>

      {exercise.instructions ? (
        <Stack spacing={0.5}>
          <Typography variant="labelLarge" component="h2">
            Instruções
          </Typography>
          <Typography variant="body1">{exercise.instructions}</Typography>
        </Stack>
      ) : null}

      <FormControl sx={{ maxWidth: 240 }}>
        <InputLabel id="exercise-preference-label">Preferência</InputLabel>
        <Select
          labelId="exercise-preference-label"
          label="Preferência"
          value={exercise.exercisePreference ?? 'neutral'}
          onChange={(event) => handlePreferenceChange(event.target.value as ExercisePreference)}
        >
          {exercisePreferenceOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack spacing={1}>
        <Typography variant="labelLarge" component="h2">
          Recordes pessoais
        </Typography>
        {records.length === 0 ? (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Ainda sem recordes registrados para este exercício.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {records.map((record) => (
              <Stack
                key={record.id}
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography variant="body2">
                  {personalRecordTypeLabels[record.recordType]}
                  {record.reps ? ` (${record.reps} reps)` : ''}
                </Typography>
                <Typography variant="labelMedium">
                  {record.recordType === 'maxReps'
                    ? `${record.value} reps`
                    : formatWeight(record.value, 'kg')}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>

      <Stack spacing={1}>
        <Typography variant="labelLarge" component="h2">
          Histórico
        </Typography>
        {history.length === 0 ? (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Você ainda não treinou este exercício.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {history.slice(0, 8).map((entry) => (
              <Stack
                key={entry.session.id}
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography variant="body2">
                  {new Date(entry.session.startedAt).toLocaleDateString('pt-BR')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {entry.performedSets
                    .filter((set) => set.completed)
                    .map((set) =>
                      set.weightKg
                        ? `${formatWeight(set.weightKg, 'kg')}x${set.reps ?? '?'}`
                        : `${set.reps ?? '?'} reps`,
                    )
                    .join(', ')}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>

      {exercise.exerciseType === 'strength' && !exercise.instructions ? (
        <Alert severity="info" variant="outlined">
          Este exercício ainda não tem instruções cadastradas.
        </Alert>
      ) : null}
    </Stack>
  );
}
