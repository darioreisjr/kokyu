'use client';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { useConfirmAction } from '../../hooks/useConfirmAction';
import { sessionService } from '../../services/sessionService';
import type { PerformedSet, WorkoutSession } from '../../types';
import { formatDurationMinutes } from '../../utils/trainingFormatting';
import { toDisplayWeight, toKg } from '../../utils/weightUnit';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';

export interface SessionDetailDialogProps {
  open: boolean;
  session: WorkoutSession | null;
  performedSets: PerformedSet[];
  weightUnit: 'kg' | 'lb';
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

/** Corrections (peso registrado incorretamente, etc.) and deletion — both explicitly required for a completed session. */
export function SessionDetailDialog({
  open,
  session: sessionOrNull,
  performedSets,
  weightUnit,
  onClose,
  onUpdated,
  onDeleted,
}: SessionDetailDialogProps) {
  const confirmAction = useConfirmAction();

  if (!sessionOrNull) return null;
  // A fresh `const` so nested closures below keep the non-null narrowing — TypeScript doesn't
  // retain control-flow narrowing of a captured variable across a closure boundary otherwise.
  const session = sessionOrNull;

  async function handleWeightBlur(setId: string, rawValue: string) {
    if (rawValue === '') return;
    await sessionService.updatePerformedSet(setId, {
      weightKg: toKg(Number(rawValue), weightUnit),
    });
    onUpdated();
  }

  async function handleRepsBlur(setId: string, rawValue: string) {
    if (rawValue === '') return;
    await sessionService.updatePerformedSet(setId, { reps: Number(rawValue) });
    onUpdated();
  }

  function handleDelete() {
    confirmAction.request({
      title: 'Excluir sessão',
      description:
        'Esta sessão e suas séries serão excluídas permanentemente. Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        await sessionService.deleteWorkoutSession(session.id);
        onDeleted();
      },
    });
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="session-detail-title"
      >
        <DialogTitle id="session-detail-title">{session.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {new Date(session.startedAt).toLocaleDateString('pt-BR')} ·{' '}
              {session.durationSeconds ? formatDurationMinutes(session.durationSeconds) : '—'}
            </Typography>

            {session.sessionExercises.map((sessionExercise) => (
              <Stack key={sessionExercise.id} spacing={1}>
                <Typography variant="labelLarge">{sessionExercise.exerciseName}</Typography>
                {performedSets
                  .filter((set) => set.sessionExerciseId === sessionExercise.id)
                  .map((set) => (
                    <Stack key={set.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="labelSmall" sx={{ minWidth: 24 }}>
                        {set.setNumber}
                      </Typography>
                      {typeof set.weightKg === 'number' ? (
                        <TextField
                          size="small"
                          type="number"
                          defaultValue={toDisplayWeight(set.weightKg, weightUnit)}
                          onBlur={(event) => handleWeightBlur(set.id, event.target.value)}
                          slotProps={{
                            htmlInput: {
                              'aria-label': `Peso, série ${set.setNumber}`,
                              style: { width: 64 },
                            },
                          }}
                        />
                      ) : null}
                      {typeof set.reps === 'number' ? (
                        <TextField
                          size="small"
                          type="number"
                          defaultValue={set.reps}
                          onBlur={(event) => handleRepsBlur(set.id, event.target.value)}
                          slotProps={{
                            htmlInput: {
                              'aria-label': `Repetições, série ${set.setNumber}`,
                              style: { width: 56 },
                            },
                          }}
                        />
                      ) : null}
                    </Stack>
                  ))}
              </Stack>
            ))}

            {session.notes ? (
              <Stack spacing={0.5}>
                <Typography variant="labelLarge">Observações</Typography>
                <Typography variant="body2">{session.notes}</Typography>
              </Stack>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <KokyuButton
            variant="text"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={handleDelete}
          >
            Excluir
          </KokyuButton>
          <KokyuButton variant="contained" onClick={onClose}>
            Fechar
          </KokyuButton>
        </DialogActions>
      </Dialog>
      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </>
  );
}
