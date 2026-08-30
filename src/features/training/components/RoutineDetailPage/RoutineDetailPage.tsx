'use client';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { KokyuButton, EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { muscleGroupLabels } from '../../constants/muscleGroups';
import { setTypeLabels } from '../../constants/setTypes';
import { trainingRoutes } from '../../constants/trainingRoutes';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useExercises } from '../../hooks/useExercises';
import { useRoutine } from '../../hooks/useRoutine';
import { useStartWorkout } from '../../hooks/useStartWorkout';
import { routineService } from '../../services/routineService';
import type { ExerciseGroup } from '../../types';
import {
  formatDurationMinutes,
  formatRepRange,
  formatRestSeconds,
} from '../../utils/trainingFormatting';
import { ActiveSessionConflictDialog } from '../ActiveSessionConflictDialog/ActiveSessionConflictDialog';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';

export interface RoutineDetailPageProps {
  routineId: string;
}

export function RoutineDetailPage({ routineId }: RoutineDetailPageProps) {
  const router = useRouter();
  const { status, routine, reload } = useRoutine(routineId);
  const { exercises } = useExercises();
  const confirmAction = useConfirmAction();
  const startWorkout = useStartWorkout();

  const exerciseNameById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise.name] as const)),
    [exercises],
  );

  const groupByExerciseId = useMemo(() => {
    const map = new Map<string, ExerciseGroup>();
    for (const group of routine?.groups ?? []) {
      if (group.kind === 'single') map.set(group.routineExerciseId, group);
      else for (const id of group.routineExerciseIds) map.set(id, group);
    }
    return map;
  }, [routine]);

  if (status === 'loading') {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  if (!routine) {
    return (
      <EmptyState
        title="Treino não encontrado."
        action={
          <KokyuButton variant="contained" component={NextLink} href={trainingRoutes.routines}>
            Voltar para Meus treinos
          </KokyuButton>
        }
      />
    );
  }

  async function handleToggleFavorite() {
    await routineService.toggleFavoriteRoutine(routineId);
    reload();
  }

  async function handleDuplicate() {
    const duplicate = await routineService.duplicateRoutine(routineId);
    if (duplicate) router.push(trainingRoutes.routine(duplicate.id));
  }

  function handleArchive() {
    confirmAction.request({
      title: 'Arquivar treino',
      description: `"${routine!.name}" será movido para os treinos arquivados.`,
      confirmLabel: 'Arquivar',
      onConfirm: async () => {
        await routineService.archiveRoutine(routineId);
        router.push(trainingRoutes.routines);
      },
    });
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton
          component={NextLink}
          href={trainingRoutes.routines}
          aria-label="Voltar para Meus treinos"
          size="small"
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="displaySmall" component="h1" sx={{ flexGrow: 1 }}>
          {routine.name}
        </Typography>
        <IconButton
          aria-label={routine.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={handleToggleFavorite}
        >
          {routine.favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
      </Stack>

      {routine.description ? <Typography variant="body1">{routine.description}</Typography> : null}

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        {routine.estimatedDurationMinutes ? (
          <Chip label={formatDurationMinutes(routine.estimatedDurationMinutes * 60)} size="small" />
        ) : null}
        {routine.muscleGroups.map((muscle) => (
          <Chip key={muscle} label={muscleGroupLabels[muscle]} size="small" variant="outlined" />
        ))}
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <KokyuButton
          variant="contained"
          startIcon={<PlayArrowRoundedIcon />}
          onClick={() => startWorkout.requestStartRoutine(routine, exercises)}
        >
          Iniciar treino
        </KokyuButton>
        <KokyuButton
          variant="outlined"
          component={NextLink}
          href={trainingRoutes.editRoutine(routineId)}
          startIcon={<EditRoundedIcon />}
        >
          Editar
        </KokyuButton>
        <KokyuButton
          variant="outlined"
          startIcon={<ContentCopyRoundedIcon />}
          onClick={handleDuplicate}
        >
          Duplicar
        </KokyuButton>
        {!routine.archived ? (
          <KokyuButton
            variant="text"
            color="error"
            startIcon={<InventoryRoundedIcon />}
            onClick={handleArchive}
          >
            Arquivar
          </KokyuButton>
        ) : null}
      </Stack>

      <Stack spacing={1.5}>
        {routine.exercises.map((routineExercise) => {
          const group = groupByExerciseId.get(routineExercise.id);
          return (
            <Stack
              key={routineExercise.id}
              spacing={0.5}
              sx={(theme) => ({
                borderRadius: cardTokens.radius,
                border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                padding: 2,
              })}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="labelLarge" component="p">
                  {exerciseNameById.get(routineExercise.exerciseId) ?? routineExercise.exerciseId}
                </Typography>
                {group && group.kind !== 'single' ? (
                  <Chip label={group.kind === 'superset' ? 'Superset' : 'Circuito'} size="small" />
                ) : null}
              </Stack>
              <Stack spacing={0.25}>
                {routineExercise.sets.map((set) => (
                  <Typography
                    key={set.id}
                    variant="body2"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  >
                    {setTypeLabels[set.setType]}
                    {formatRepRange(set) ? ` · ${formatRepRange(set)}` : ''}
                    {set.targetLoadKg ? ` · ${set.targetLoadKg}kg` : ''}
                    {` · descanso ${formatRestSeconds(set.restSeconds)}`}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          );
        })}
      </Stack>

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
      <ActiveSessionConflictDialog
        open={Boolean(startWorkout.pendingConflict)}
        activeSessionName={startWorkout.activeSessionName}
        onContinue={startWorkout.resolveContinue}
        onDiscardAndStartNew={startWorkout.resolveDiscardAndStartNew}
        onCancel={startWorkout.cancelConflict}
      />
    </Stack>
  );
}
