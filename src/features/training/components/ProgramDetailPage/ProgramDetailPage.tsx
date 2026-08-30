'use client';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useMemo } from 'react';

import { KokyuButton, EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import {
  programStatusLabels,
  trainingBlockTypeLabels,
  weekdayShortLabels,
} from '../../constants/programLabels';
import { trainingRoutes } from '../../constants/trainingRoutes';
import { useProgram } from '../../hooks/useProgram';
import { useRoutines } from '../../hooks/useRoutines';
import { programService } from '../../services/programService';
import { trainingScheduleService } from '../../services/trainingScheduleService';
import { toDateKey } from '../../utils/dateHelpers';

export interface ProgramDetailPageProps {
  programId: string;
}

export function ProgramDetailPage({ programId }: ProgramDetailPageProps) {
  const { status, program, reload } = useProgram(programId);
  const { routines } = useRoutines();
  const routineNameById = useMemo(
    () => new Map(routines.map((routine) => [routine.id, routine.name] as const)),
    [routines],
  );

  if (status === 'loading') {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  if (!program) {
    return (
      <EmptyState
        title="Programa não encontrado."
        action={
          <KokyuButton variant="contained" component={NextLink} href={trainingRoutes.programs}>
            Voltar para Programas
          </KokyuButton>
        }
      />
    );
  }

  async function handleStart() {
    const startDate = toDateKey(new Date());
    const started = await programService.startProgram(programId, startDate);
    if (started) await trainingScheduleService.generateEntriesFromProgram(started);
    reload();
  }

  async function handlePause() {
    await programService.pauseProgram(programId);
    reload();
  }

  async function handleResume() {
    await programService.resumeProgram(programId);
    reload();
  }

  async function handleComplete() {
    await programService.completeProgram(programId);
    reload();
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton
          component={NextLink}
          href={trainingRoutes.programs}
          aria-label="Voltar para Programas"
          size="small"
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="displaySmall" component="h1" sx={{ flexGrow: 1 }}>
          {program.name}
        </Typography>
        <Chip label={programStatusLabels[program.status]} />
      </Stack>

      {program.description ? <Typography variant="body1">{program.description}</Typography> : null}

      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {program.durationWeeks} semanas
        {program.daysPerWeek ? ` · ${program.daysPerWeek}x por semana` : ''}
        {program.startDate
          ? ` · início em ${new Date(program.startDate).toLocaleDateString('pt-BR')}`
          : ''}
      </Typography>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <KokyuButton
          variant="outlined"
          component={NextLink}
          href={trainingRoutes.editProgram(programId)}
          startIcon={<EditRoundedIcon />}
        >
          Editar
        </KokyuButton>
        {program.status === 'draft' ? (
          <KokyuButton
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={handleStart}
          >
            Iniciar programa
          </KokyuButton>
        ) : null}
        {program.status === 'active' ? (
          <KokyuButton variant="outlined" startIcon={<PauseRoundedIcon />} onClick={handlePause}>
            Pausar
          </KokyuButton>
        ) : null}
        {program.status === 'paused' ? (
          <KokyuButton
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={handleResume}
          >
            Retomar
          </KokyuButton>
        ) : null}
        {program.status === 'active' || program.status === 'paused' ? (
          <KokyuButton variant="text" startIcon={<CheckRoundedIcon />} onClick={handleComplete}>
            Finalizar programa
          </KokyuButton>
        ) : null}
      </Stack>

      <Stack spacing={2}>
        {program.blocks.map((block) => (
          <Stack
            key={block.id}
            spacing={1.5}
            sx={(theme) => ({
              borderRadius: cardTokens.radius,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
              padding: 2,
            })}
          >
            <Typography variant="labelLarge" component="h2">
              {block.name} · {trainingBlockTypeLabels[block.type]}
            </Typography>
            {block.weeks.map((week, weekIndex) => (
              <Stack
                key={week.id}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}
              >
                <Typography variant="labelSmall" sx={{ minWidth: 72 }}>
                  Semana {weekIndex + 1}
                  {week.isDeload ? ' (redução)' : ''}
                </Typography>
                {week.scheduledRoutines.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  >
                    Nenhum treino planejado
                  </Typography>
                ) : (
                  week.scheduledRoutines
                    .sort((a, b) => a.weekday - b.weekday)
                    .map((slot) => (
                      <Chip
                        key={slot.weekday}
                        size="small"
                        label={`${weekdayShortLabels[slot.weekday]}: ${routineNameById.get(slot.routineId) ?? slot.routineId}`}
                      />
                    ))
                )}
              </Stack>
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
