'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import {
  checkInFormDefaultValues,
  checkInSchema,
  type CheckInFormValues,
} from '../../schemas/checkInSchema';

export interface GoalCheckInDialogProps {
  open: boolean;
  goalTitle?: string;
  onClose: () => void;
  onSave: (values: CheckInFormValues) => void;
  isSubmitting?: boolean;
}

const perceivedStatusOptions: { value: CheckInFormValues['perceivedStatus']; label: string }[] = [
  { value: 'onTrack', label: 'No ritmo' },
  { value: 'attention', label: 'Atenção' },
  { value: 'atRisk', label: 'Em risco' },
];

/**
 * One dialog covers both "check-in rápido" and "check-in completo" — starts collapsed to just
 * the status question, "Adicionar comentário" reveals the reflection fields. Nothing beyond
 * `perceivedStatus` is ever required (see the spec's own "não tornar obrigatório").
 */
export function GoalCheckInDialog({
  open,
  goalTitle,
  onClose,
  onSave,
  isSubmitting = false,
}: GoalCheckInDialogProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: checkInFormDefaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(checkInFormDefaultValues);
      queueMicrotask(() => setExpanded(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="goal-checkin-title"
    >
      <DialogTitle id="goal-checkin-title">Como está esta meta?</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="goal-checkin-form"
          spacing={2.5}
          onSubmit={handleSubmit((values) => onSave(values))}
          noValidate
          sx={{ paddingTop: 1 }}
        >
          {goalTitle ? (
            <Typography variant="body2" color="text.secondary">
              {goalTitle}
            </Typography>
          ) : null}

          <Controller
            control={control}
            name="perceivedStatus"
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive
                value={field.value}
                onChange={(_event, next: CheckInFormValues['perceivedStatus'] | null) =>
                  next && field.onChange(next)
                }
                aria-label="Como está esta meta?"
                fullWidth
              >
                {perceivedStatusOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={option.value}
                    sx={{ textTransform: 'none' }}
                  >
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
          />
          {errors.perceivedStatus ? (
            <Typography variant="labelSmall" color="error">
              {errors.perceivedStatus.message}
            </Typography>
          ) : null}

          {!expanded ? (
            <KokyuButton
              variant="text"
              onClick={() => setExpanded(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Adicionar comentário
            </KokyuButton>
          ) : (
            <>
              <Controller
                control={control}
                name="whatMovedForward"
                render={({ field }) => (
                  <KokyuTextField
                    {...field}
                    label="O que avançou desde a última revisão?"
                    multiline
                    minRows={2}
                  />
                )}
              />
              <Controller
                control={control}
                name="whatIsBlocking"
                render={({ field }) => (
                  <KokyuTextField {...field} label="Existe algum bloqueio?" multiline minRows={2} />
                )}
              />
              <Controller
                control={control}
                name="nextStep"
                render={({ field }) => (
                  <KokyuTextField {...field} label="Qual será seu próximo passo?" />
                )}
              />
              <Controller
                control={control}
                name="confidence"
                render={({ field }) => (
                  <Stack spacing={1}>
                    <Typography variant="labelMedium" id="goal-checkin-confidence-label">
                      Confiança
                    </Typography>
                    <Slider
                      value={field.value ?? 3}
                      onChange={(_event, value) => field.onChange(value)}
                      min={1}
                      max={5}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      aria-labelledby="goal-checkin-confidence-label"
                    />
                  </Stack>
                )}
              />
              <Controller
                control={control}
                name="note"
                render={({ field }) => (
                  <KokyuTextField {...field} label="Nota livre" multiline minRows={2} />
                )}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          type="submit"
          form="goal-checkin-form"
          variant="contained"
          loading={isSubmitting}
        >
          Salvar check-in
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
