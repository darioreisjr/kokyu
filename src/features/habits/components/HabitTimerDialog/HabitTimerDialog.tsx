'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { useHabitTimer } from '../../hooks/useHabitTimer';
import type { Habit } from '../../types/habit.types';

export interface HabitTimerDialogProps {
  open: boolean;
  habit: Habit | null;
  onClose: () => void;
  onComplete: (loggedMinutes: number, note?: string) => Promise<void> | void;
}

export function HabitTimerDialog({
  open,
  habit,
  onClose,
  onComplete,
}: HabitTimerDialogProps) {
  const {
    isRunning,
    isPaused,
    remainingSeconds,
    elapsedSeconds,
    progressPercent,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useHabitTimer();

  const defaultMinutes =
    habit && habit.target.type === 'duration' ? habit.target.targetMinutes : 25;
  const presets =
    habit && habit.target.type === 'duration' && habit.target.timerPresets
      ? habit.target.timerPresets
      : [5, 10, 15, 25, 30, 45];

  const [customMinutes, setCustomMinutes] = useState<number | null>(null);
  const selectedMinutes = customMinutes ?? defaultMinutes;
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = () => {
    start(selectedMinutes);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const loggedMins = stop();
      await onComplete(loggedMins, note.trim() || undefined);
      setCustomMinutes(null);
      setNote('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isRunning || isPaused) {
      if (window.confirm('Deseja encerrar o timer e salvar o tempo decorrido?')) {
        handleFinish();
        return;
      }
      reset();
    }
    setCustomMinutes(null);
    setNote('');
    onClose();
  };

  const displaySeconds = isRunning || isPaused ? remainingSeconds : selectedMinutes * 60;
  const mins = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const elapsedMins = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = elapsedSeconds % 60;
  const formattedElapsed = `${String(elapsedMins).padStart(2, '0')}:${String(elapsedSecs).padStart(2, '0')}`;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="habit-timer-title"
    >
      <DialogTitle
        id="habit-timer-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
          {habit?.name ?? 'Timer de Foco'}
        </Typography>
        <IconButton onClick={handleClose} size="small" aria-label="Fechar timer">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={180}
              thickness={4}
              sx={(theme) => ({
                color: themePalette(theme).kokyu.border.subtle,
              })}
            />
            <CircularProgress
              variant="determinate"
              value={progressPercent}
              size={180}
              thickness={4}
              sx={(theme) => ({
                color: themePalette(theme).kokyu.action.primary,
                position: 'absolute',
                left: 0,
              })}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                {formattedTime}
              </Typography>
              <Typography
                variant="caption"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {isRunning
                  ? `Decorrido: ${formattedElapsed}`
                  : isPaused
                    ? 'Pausado'
                    : `Alvo: ${selectedMinutes} min`}
              </Typography>
            </Box>
          </Box>

          {!isRunning && !isPaused && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              {presets.map((minsPreset) => (
                <Chip
                  key={minsPreset}
                  label={`${minsPreset} min`}
                  clickable
                  color={selectedMinutes === minsPreset ? 'primary' : 'default'}
                  onClick={() => setCustomMinutes(minsPreset)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          )}

          <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
            {!isRunning && !isPaused && (
              <KokyuButton
                variant="contained"
                size="large"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={handleStart}
                sx={{ flex: 1 }}
              >
                Iniciar Timer
              </KokyuButton>
            )}

            {isRunning && (
              <>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PauseRoundedIcon />}
                  onClick={pause}
                  sx={{ flex: 1 }}
                >
                  Pausar
                </Button>
                <KokyuButton
                  variant="contained"
                  size="large"
                  startIcon={<StopRoundedIcon />}
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  sx={{ flex: 1 }}
                >
                  Concluir
                </KokyuButton>
              </>
            )}

            {isPaused && (
              <>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={resume}
                  sx={{ flex: 1 }}
                >
                  Retomar
                </Button>
                <KokyuButton
                  variant="contained"
                  size="large"
                  startIcon={<StopRoundedIcon />}
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  sx={{ flex: 1 }}
                >
                  Concluir
                </KokyuButton>
              </>
            )}
          </Stack>

          <TextField
            fullWidth
            label="Nota opcional para esta sessão"
            placeholder="Como foi a sessão de foco?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            size="small"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
