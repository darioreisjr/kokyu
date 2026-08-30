'use client';

import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { personalRecordTypeLabels } from '../../constants/personalRecordLabels';
import type { PerformedSet, PersonalRecordCheckResult, WorkoutSession } from '../../types';
import { formatDurationMinutes } from '../../utils/trainingFormatting';
import { formatWeight } from '../../utils/weightUnit';

export interface WorkoutSummaryDialogProps {
  open: boolean;
  session: WorkoutSession;
  performedSets: PerformedSet[];
  newRecords: PersonalRecordCheckResult[];
  weightUnit: 'kg' | 'lb';
  onClose: () => void;
  /** Only offered for sessions without a `routineId` — a routine-based session already has one (per the spec's own "oferecer salvar como rotina", never required). */
  onSaveAsRoutine?: () => void;
  isSavingRoutine?: boolean;
  savedRoutineId?: string;
}

export function WorkoutSummaryDialog({
  open,
  session,
  performedSets,
  newRecords,
  weightUnit,
  onClose,
  onSaveAsRoutine,
  isSavingRoutine,
  savedRoutineId,
}: WorkoutSummaryDialogProps) {
  const completedSets = performedSets.filter((set) => set.completed);
  const workingSets = completedSets.filter((set) => set.setType !== 'warmup');
  const totalVolumeKg = workingSets.reduce(
    (total, set) => total + (set.weightKg ?? 0) * (set.reps ?? 0),
    0,
  );
  const achievedRecords = newRecords.filter((record) => record.isNewRecord);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="workout-summary-title"
    >
      <DialogTitle id="workout-summary-title">Treino concluído</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="displaySmall" component="p">
            {session.name}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <SummaryStat
              label="Duração"
              value={session.durationSeconds ? formatDurationMinutes(session.durationSeconds) : '—'}
            />
            <SummaryStat label="Exercícios" value={String(session.sessionExercises.length)} />
            <SummaryStat label="Séries" value={String(completedSets.length)} />
            <SummaryStat label="Volume" value={formatWeight(totalVolumeKg, weightUnit)} />
          </Stack>

          {achievedRecords.length > 0 ? (
            <Stack spacing={0.5}>
              <Typography variant="labelLarge">Novos recordes pessoais</Typography>
              {achievedRecords.map((record, index) => (
                <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <EmojiEventsRoundedIcon fontSize="small" color="warning" aria-hidden="true" />
                  <Typography variant="body2">
                    {personalRecordTypeLabels[record.recordType]}:{' '}
                    {record.recordType === 'maxReps'
                      ? `${record.newValue} reps`
                      : formatWeight(record.newValue, weightUnit)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : null}

          {session.notes ? (
            <Stack spacing={0.5}>
              <Typography variant="labelLarge">Observações</Typography>
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {session.notes}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        {onSaveAsRoutine && !session.routineId ? (
          <KokyuButton
            variant="outlined"
            loading={isSavingRoutine}
            disabled={Boolean(savedRoutineId)}
            onClick={onSaveAsRoutine}
          >
            {savedRoutineId ? 'Rotina salva' : 'Salvar como rotina'}
          </KokyuButton>
        ) : null}
        <KokyuButton variant="contained" onClick={onClose}>
          Concluir
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0}>
      <Typography
        variant="labelSmall"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {label}
      </Typography>
      <Typography variant="labelLarge">{value}</Typography>
    </Stack>
  );
}
