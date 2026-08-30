'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import type { PerformedSet, SessionExercise, SetType, TrainingPreferences } from '../../types';
import { PreviousPerformanceHint } from '../PreviousPerformanceHint/PreviousPerformanceHint';
import { WorkoutSetRow } from '../WorkoutSetRow/WorkoutSetRow';

export interface ActiveExerciseCardProps {
  sessionExercise: SessionExercise;
  performedSets: PerformedSet[];
  previousPerformedSets: PerformedSet[] | null;
  preferences: TrainingPreferences;
  /** Count of other session exercises sharing this one's `groupId`, including itself — 2+ means a superset. */
  groupedCount: number;
  onLogSet: (
    setNumber: number,
    patch: {
      setType: SetType;
      weightKg?: number;
      reps?: number;
      rpe?: number;
      rir?: number;
      completed: boolean;
    },
  ) => void;
  onAddSet: () => void;
  onRemoveExercise: () => void;
  onSubstitute: () => void;
  onNotesChange: (notes: string) => void;
  onOpenPlateCalculator: (targetWeightKg?: number) => void;
  onOpenWarmupCalculator: (workingWeightKg?: number, workingReps?: number) => void;
}

export function ActiveExerciseCard({
  sessionExercise,
  performedSets,
  previousPerformedSets,
  preferences,
  groupedCount,
  onLogSet,
  onAddSet,
  onRemoveExercise,
  onSubstitute,
  onNotesChange,
  onOpenPlateCalculator,
  onOpenWarmupCalculator,
}: ActiveExerciseCardProps) {
  const firstWorkingSet = sessionExercise.sets.find((set) => set.setType === 'working');

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="displaySmall" component="h2">
          {sessionExercise.exerciseName}
        </Typography>
        {groupedCount > 1 ? <Chip label="Superset" size="small" /> : null}
      </Stack>

      <PreviousPerformanceHint
        performedSets={previousPerformedSets}
        weightUnit={preferences.weightUnit}
      />

      <Stack spacing={1.5}>
        {sessionExercise.sets.map((prescription) => (
          <WorkoutSetRow
            key={prescription.setNumber}
            prescription={prescription}
            performedSet={performedSets.find((set) => set.setNumber === prescription.setNumber)}
            previousSet={previousPerformedSets?.find(
              (set) => set.setNumber === prescription.setNumber,
            )}
            weightUnit={preferences.weightUnit}
            showRpeRir={preferences.showRpeRir}
            onLog={(patch) => onLogSet(prescription.setNumber, patch)}
          />
        ))}
      </Stack>

      <KokyuButton size="small" variant="text" startIcon={<AddRoundedIcon />} onClick={onAddSet}>
        Adicionar série
      </KokyuButton>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <KokyuButton
          size="small"
          variant="outlined"
          startIcon={<CalculateRoundedIcon />}
          onClick={() => onOpenPlateCalculator(firstWorkingSet?.targetLoadKg)}
        >
          Anilhas
        </KokyuButton>
        <KokyuButton
          size="small"
          variant="outlined"
          startIcon={<CalculateRoundedIcon />}
          onClick={() =>
            onOpenWarmupCalculator(firstWorkingSet?.targetLoadKg, firstWorkingSet?.targetReps)
          }
        >
          Aquecimento
        </KokyuButton>
        <KokyuButton
          size="small"
          variant="outlined"
          startIcon={<SwapHorizRoundedIcon />}
          onClick={onSubstitute}
        >
          Substituir
        </KokyuButton>
        <KokyuButton
          size="small"
          variant="text"
          color="error"
          startIcon={<CloseRoundedIcon />}
          onClick={onRemoveExercise}
        >
          Remover
        </KokyuButton>
      </Stack>

      <KokyuTextField
        label="Notas (opcional)"
        size="small"
        multiline
        minRows={2}
        defaultValue={sessionExercise.notes ?? ''}
        onBlur={(event) => onNotesChange(event.target.value)}
      />
    </Stack>
  );
}
