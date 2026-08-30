'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { KokyuButton, EmptyState } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { trainingRoutes } from '../../constants/trainingRoutes';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useElapsedSeconds } from '../../hooks/useElapsedSeconds';
import { useExerciseHistory } from '../../hooks/useExerciseHistory';
import { useTrainingPreferences } from '../../hooks/useTrainingPreferences';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import { useTrainingSession } from '../../providers/TrainingSessionProvider';
import { checkForPersonalRecords } from '../../services/personalRecordEngine';
import { personalRecordService } from '../../services/personalRecordService';
import { routineService } from '../../services/routineService';
import type {
  Exercise,
  PerformedSet,
  PersonalRecordCheckResult,
  RoutineExercise,
  SetType,
  WorkoutSession,
} from '../../types';
import { createTempId } from '../../utils/createTempId';
import { formatSecondsClock } from '../../utils/trainingFormatting';
import { ActiveExerciseCard } from '../ActiveExerciseCard/ActiveExerciseCard';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { ExercisePickerDialog } from '../ExercisePickerDialog/ExercisePickerDialog';
import { FinishWorkoutDialog } from '../FinishWorkoutDialog/FinishWorkoutDialog';
import { PlateCalculatorDialog } from '../PlateCalculatorDialog/PlateCalculatorDialog';
import { RestTimerBar } from '../RestTimerBar/RestTimerBar';
import { WarmupCalculatorDialog } from '../WarmupCalculatorDialog/WarmupCalculatorDialog';
import { WorkoutSummaryDialog } from '../WorkoutSummaryDialog/WorkoutSummaryDialog';

export interface ActiveWorkoutPageProps {
  sessionId: string;
}

interface FinishedSummary {
  session: WorkoutSession;
  performedSets: PerformedSet[];
  newRecords: PersonalRecordCheckResult[];
}

export function ActiveWorkoutPage({ sessionId }: ActiveWorkoutPageProps) {
  const router = useRouter();
  const {
    activeSession,
    isHydrated,
    logSet,
    addSetToExercise,
    addExerciseToSession,
    removeExerciseFromSession,
    substituteExercise,
    startRest,
    skipRest,
    goToExercise,
    updateNotes,
    finishWorkout,
    discardSession,
  } = useTrainingSession();
  const { preferences } = useTrainingPreferences();
  const confirmAction = useConfirmAction();
  const { showSuccess } = useSnackbar();
  const elapsedSeconds = useElapsedSeconds(activeSession?.startedAt);
  const isSessionMismatch = isHydrated && (!activeSession || activeSession.sessionId !== sessionId);
  const { session: completedSession, performedSets: completedPerformedSets } = useWorkoutSession(
    isSessionMismatch ? sessionId : '__none__',
  );

  const [plateCalc, setPlateCalc] = useState<{ open: boolean; targetWeightKg?: number }>({
    open: false,
  });
  const [warmupCalc, setWarmupCalc] = useState<{
    open: boolean;
    workingWeightKg?: number;
    workingReps?: number;
  }>({ open: false });
  const [substitutePickerOpen, setSubstitutePickerOpen] = useState(false);
  const [addExercisePickerOpen, setAddExercisePickerOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishedSummary, setFinishedSummary] = useState<FinishedSummary | null>(null);
  const [isSavingRoutine, setIsSavingRoutine] = useState(false);
  const [savedRoutineId, setSavedRoutineId] = useState<string | undefined>(undefined);

  const currentExercise = activeSession?.sessionExercises[activeSession.currentExerciseIndex];
  const { history: exerciseHistory } = useExerciseHistory(
    currentExercise?.exerciseId ?? '__none__',
  );
  const previousPerformedSets = exerciseHistory[0]?.performedSets ?? null;

  async function handleSaveAsRoutine() {
    if (!finishedSummary) return;
    setIsSavingRoutine(true);
    try {
      const exercisesInput: RoutineExercise[] = finishedSummary.session.sessionExercises.map(
        (sessionExercise, index) => ({
          id: createTempId('routine-exercise'),
          exerciseId: sessionExercise.exerciseId,
          order: index + 1,
          groupId: sessionExercise.groupId,
          progression: { strategy: 'manual' },
          sets: sessionExercise.sets.map((set, setIndex) => ({
            id: createTempId('set'),
            order: setIndex + 1,
            setType: set.setType,
            targetReps: set.targetReps,
            targetRepsMax: set.targetRepsMax,
            targetLoadKg: set.targetLoadKg,
            loadType: set.loadType,
            targetDurationSeconds: set.targetDurationSeconds,
            targetDistanceMeters: set.targetDistanceMeters,
            restSeconds: set.restSeconds,
          })),
        }),
      );
      const created = await routineService.createRoutine({
        name: finishedSummary.session.name,
        exercises: exercisesInput,
        groups: exercisesInput.map((exercise) => ({
          id: `group-${exercise.id}`,
          kind: 'single',
          routineExerciseId: exercise.id,
        })),
      });
      setSavedRoutineId(created.id);
    } finally {
      setIsSavingRoutine(false);
    }
  }

  if (finishedSummary) {
    return (
      <WorkoutSummaryDialog
        open
        session={finishedSummary.session}
        performedSets={finishedSummary.performedSets}
        newRecords={finishedSummary.newRecords}
        weightUnit={preferences?.weightUnit ?? 'kg'}
        onClose={() => router.push(trainingRoutes.history)}
        onSaveAsRoutine={handleSaveAsRoutine}
        isSavingRoutine={isSavingRoutine}
        savedRoutineId={savedRoutineId}
      />
    );
  }

  if (!isHydrated || !preferences) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  if (completedSession) {
    return (
      <WorkoutSummaryDialog
        open
        session={completedSession}
        performedSets={completedPerformedSets}
        newRecords={[]}
        weightUnit={preferences.weightUnit}
        onClose={() => router.push(trainingRoutes.history)}
      />
    );
  }

  if (!activeSession || activeSession.sessionId !== sessionId) {
    return (
      <EmptyState
        title="Nenhum treino em andamento."
        description="Essa sessão não está mais ativa."
        action={
          <KokyuButton variant="contained" onClick={() => router.push(trainingRoutes.today)}>
            Voltar para Hoje
          </KokyuButton>
        }
      />
    );
  }

  const performedSetsForCurrent = currentExercise
    ? activeSession.performedSets.filter((set) => set.sessionExerciseId === currentExercise.id)
    : [];
  const groupedCount = currentExercise?.groupId
    ? activeSession.sessionExercises.filter(
        (exercise) => exercise.groupId === currentExercise.groupId,
      ).length
    : 1;

  async function handleLogSet(
    setNumber: number,
    patch: {
      setType: SetType;
      weightKg?: number;
      reps?: number;
      rpe?: number;
      rir?: number;
      completed: boolean;
    },
  ) {
    if (!currentExercise || !activeSession) return;
    logSet(currentExercise.id, { setNumber, ...patch });
    if (patch.completed && preferences?.autoStartRestTimer) {
      const restSeconds =
        currentExercise.sets.find((set) => set.setNumber === setNumber)?.restSeconds ??
        preferences.defaultRestSeconds;
      startRest(restSeconds);
    }
    if (patch.completed)
      await checkForLivePersonalRecord(
        currentExercise,
        activeSession.sessionId,
        activeSession.performedSets,
        setNumber,
        patch,
      );
  }

  /**
   * Discreet "Novo recorde pessoal" feedback while logging, mirroring what `sessionService.completeWorkout`
   * will authoritatively persist at the end — this check itself never writes anything. Built from the
   * provider's last-known `performedSets` (the `logSet` call above hasn't re-rendered yet) merged with the
   * set just logged, so it doesn't need to wait for the state update to land.
   */
  async function checkForLivePersonalRecord(
    sessionExercise: NonNullable<typeof currentExercise>,
    activeSessionId: string,
    knownPerformedSets: PerformedSet[],
    setNumber: number,
    patch: {
      setType: SetType;
      weightKg?: number;
      reps?: number;
      rpe?: number;
      rir?: number;
      completed: boolean;
    },
  ) {
    const setsForExercise = knownPerformedSets.filter(
      (set) => set.sessionExerciseId === sessionExercise.id,
    );
    const mergedSet: PerformedSet = {
      id: setsForExercise.find((set) => set.setNumber === setNumber)?.id ?? createTempId('ps'),
      sessionId: activeSessionId,
      sessionExerciseId: sessionExercise.id,
      setNumber,
      setType: patch.setType,
      weightKg: patch.weightKg,
      reps: patch.reps,
      rpe: patch.rpe,
      rir: patch.rir,
      completed: true,
    };
    const mergedSetsForExercise = [
      ...setsForExercise.filter((set) => set.setNumber !== setNumber),
      mergedSet,
    ];
    const existingRecords = await personalRecordService.getPersonalRecords(
      sessionExercise.exerciseId,
    );
    const results = checkForPersonalRecords(
      sessionExercise.exerciseId,
      mergedSetsForExercise,
      existingRecords,
    );
    if (results.some((result) => result.isNewRecord)) {
      showSuccess('Novo recorde pessoal!');
    }
  }

  function handleAddExercise(exercise: Exercise) {
    addExerciseToSession(exercise);
  }

  function handleSubstitute(exercise: Exercise) {
    if (currentExercise) substituteExercise(currentExercise.id, exercise);
  }

  function handleRemoveCurrentExercise() {
    if (!currentExercise) return;
    confirmAction.request({
      title: 'Remover exercício',
      description: `"${currentExercise.exerciseName}" será removido apenas desta sessão — a rotina original não é alterada.`,
      confirmLabel: 'Remover',
      onConfirm: () => removeExerciseFromSession(currentExercise.id),
    });
  }

  function handleDiscard() {
    confirmAction.request({
      title: 'Descartar treino',
      description: 'O progresso desta sessão será perdido. Esta ação não pode ser desfeita.',
      confirmLabel: 'Descartar',
      onConfirm: () => {
        discardSession();
        router.push(trainingRoutes.today);
      },
    });
  }

  async function handleConfirmFinish(perceivedEffort?: number) {
    if (!activeSession) return;
    setIsFinishing(true);
    const capturedPerformedSets = activeSession.performedSets;
    try {
      const result = await finishWorkout(perceivedEffort);
      if (result)
        setFinishedSummary({
          session: result.session,
          performedSets: capturedPerformedSets,
          newRecords: result.newRecords,
        });
      setFinishDialogOpen(false);
    } finally {
      setIsFinishing(false);
    }
  }

  const exerciseCount = activeSession.sessionExercises.length;
  const currentIndex = activeSession.currentExerciseIndex;

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <Box
        sx={(theme) => ({
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: themePalette(theme).kokyu.background.default,
          paddingBlock: 1,
        })}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack spacing={0}>
            <Typography variant="labelLarge" component="h1">
              {activeSession.name}
            </Typography>
            <Typography
              variant="labelSmall"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {formatSecondsClock(elapsedSeconds)}
              {exerciseCount > 0 ? ` · Exercício ${currentIndex + 1} de ${exerciseCount}` : ''}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="Descartar treino" onClick={handleDiscard}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
            <KokyuButton variant="contained" onClick={() => setFinishDialogOpen(true)}>
              Finalizar
            </KokyuButton>
          </Stack>
        </Stack>
      </Box>

      {currentExercise ? (
        <>
          <ActiveExerciseCard
            sessionExercise={currentExercise}
            performedSets={performedSetsForCurrent}
            previousPerformedSets={previousPerformedSets}
            preferences={preferences}
            groupedCount={groupedCount}
            onLogSet={handleLogSet}
            onAddSet={() => addSetToExercise(currentExercise.id)}
            onRemoveExercise={handleRemoveCurrentExercise}
            onSubstitute={() => setSubstitutePickerOpen(true)}
            onNotesChange={(notes) => updateNotes(notes)}
            onOpenPlateCalculator={(targetWeightKg) => setPlateCalc({ open: true, targetWeightKg })}
            onOpenWarmupCalculator={(workingWeightKg, workingReps) =>
              setWarmupCalc({ open: true, workingWeightKg, workingReps })
            }
          />

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
            <KokyuButton
              variant="outlined"
              startIcon={<ChevronLeftRoundedIcon />}
              disabled={currentIndex === 0}
              onClick={() => goToExercise(currentIndex - 1)}
            >
              Anterior
            </KokyuButton>
            {currentIndex < exerciseCount - 1 ? (
              <KokyuButton
                variant="outlined"
                endIcon={<ChevronRightRoundedIcon />}
                onClick={() => goToExercise(currentIndex + 1)}
              >
                Próximo
              </KokyuButton>
            ) : (
              <KokyuButton
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setAddExercisePickerOpen(true)}
              >
                Adicionar exercício
              </KokyuButton>
            )}
          </Stack>
        </>
      ) : (
        <EmptyState
          title="Nenhum exercício adicionado ainda."
          description="Adicione o primeiro exercício deste treino livre."
          action={
            <KokyuButton
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setAddExercisePickerOpen(true)}
            >
              Adicionar exercício
            </KokyuButton>
          }
        />
      )}

      <RestTimerBar
        restEndAt={activeSession.restEndAt}
        onAddSeconds={(seconds) => startRest(Math.max(0, seconds))}
        onSkip={skipRest}
      />

      <PlateCalculatorDialog
        open={plateCalc.open}
        onClose={() => setPlateCalc({ open: false })}
        preferences={preferences}
        initialTargetWeightKg={plateCalc.targetWeightKg}
      />
      <WarmupCalculatorDialog
        open={warmupCalc.open}
        onClose={() => setWarmupCalc({ open: false })}
        initialWorkingWeightKg={warmupCalc.workingWeightKg}
        initialWorkingReps={warmupCalc.workingReps}
      />
      <ExercisePickerDialog
        open={substitutePickerOpen}
        onClose={() => setSubstitutePickerOpen(false)}
        onSelect={handleSubstitute}
        excludeIds={currentExercise ? [currentExercise.exerciseId] : []}
      />
      <ExercisePickerDialog
        open={addExercisePickerOpen}
        onClose={() => setAddExercisePickerOpen(false)}
        onSelect={handleAddExercise}
        excludeIds={activeSession.sessionExercises.map((exercise) => exercise.exerciseId)}
      />
      <FinishWorkoutDialog
        open={finishDialogOpen}
        onClose={() => setFinishDialogOpen(false)}
        onConfirm={handleConfirmFinish}
        isSubmitting={isFinishing}
      />
      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
