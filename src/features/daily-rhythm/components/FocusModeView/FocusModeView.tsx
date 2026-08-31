'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { useFocusSession } from '../../hooks/useFocusSession';

export function FocusModeView() {
  const {
    activeSession,
    elapsedSeconds,
    remainingSeconds,
    startSession,
    pauseSession,
    resumeSession,
    extendSession,
    recordInterruption,
    completeSession,
    cancelSession,
  } = useFocusSession();

  // Launcher state when no active session
  const [taskTitle, setTaskTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);

  // Distraction dialog state
  const [distractionOpen, setDistractionOpen] = useState(false);
  const [distractionNote, setDistractionNote] = useState('');

  // Complete dialog state
  const [completeOpen, setCompleteOpen] = useState(false);
  const [sessionNote, setSessionNote] = useState('');

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    startSession({
      sourceType: 'focus',
      sourceId: `focus-${Date.now()}`,
      title: taskTitle.trim(),
      plannedDuration: durationMinutes,
      mode: 'countdown',
    });
    setTaskTitle('');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto', textAlign: 'center', py: { xs: 2, md: 4 } }}>
      {!activeSession ? (
        <Box
          sx={(theme) => ({
            p: 4,
            borderRadius: 3,
            backgroundColor: themePalette(theme).kokyu.surface.primary,
            border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
          })}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Modo de Foco
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mb: 4 })}
          >
            Escolha uma atividade e mergulhe em um bloco de concentração sem distrações.
          </Typography>

          <Box component="form" onSubmit={handleStart}>
            <Stack spacing={3}>
              <TextField
                label="No que você vai focar agora?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                fullWidth
                required
                size="medium"
              />

              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                {[15, 25, 45, 60].map((mins) => (
                  <Chip
                    key={mins}
                    label={`${mins} min`}
                    clickable
                    color={durationMinutes === mins ? 'primary' : 'default'}
                    onClick={() => setDurationMinutes(mins)}
                    sx={{ px: 1, fontWeight: 600 }}
                  />
                ))}
              </Stack>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={!taskTitle.trim()}
                sx={{ textTransform: 'none', py: 1.5, fontWeight: 700 }}
              >
                Começar Sessão de Foco
              </Button>
            </Stack>
          </Box>
        </Box>
      ) : (
        <Box
          sx={(theme) => ({
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            backgroundColor: themePalette(theme).kokyu.surface.primary,
            border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
          })}
        >
          <Chip
            label={activeSession.status === 'paused' ? 'Pausado' : 'Foco Ativo'}
            color={activeSession.status === 'paused' ? 'warning' : 'primary'}
            size="small"
            sx={{ fontWeight: 700, mb: 2 }}
          />

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            {activeSession.title}
          </Typography>

          {/* Big Timer Display */}
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
            <Box
              sx={(theme) => ({
                width: 220,
                height: 220,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `6px solid ${themePalette(theme).kokyu.action.primary}`,
                boxShadow: theme.shadows[2],
              })}
            >
              <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: 2 }}>
                {activeSession.mode === 'countdown'
                  ? formatTimer(remainingSeconds)
                  : formatTimer(elapsedSeconds)}
              </Typography>
            </Box>
          </Box>

          {/* Primary Controls */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: 'center',
              mb: 3,
            }}
          >
            {activeSession.status === 'active' ? (
              <Button
                variant="contained"
                color="warning"
                size="large"
                startIcon={<PauseRoundedIcon />}
                onClick={pauseSession}
                sx={{ textTransform: 'none', px: 3 }}
              >
                Pausar
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={resumeSession}
                sx={{ textTransform: 'none', px: 3 }}
              >
                Continuar
              </Button>
            )}

            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckCircleRoundedIcon />}
              onClick={() => setCompleteOpen(true)}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Concluir
            </Button>
          </Stack>

          {/* Extension and Distraction Shortcuts */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={() => extendSession(5)}
              sx={{ textTransform: 'none' }}
            >
              +5 min
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => extendSession(10)}
              sx={{ textTransform: 'none' }}
            >
              +10 min
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => extendSession(15)}
              sx={{ textTransform: 'none' }}
            >
              +15 min
            </Button>
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={() => setDistractionOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Fui interrompido
            </Button>
            <Button
              size="small"
              variant="text"
              color="error"
              onClick={cancelSession}
              sx={{ textTransform: 'none' }}
            >
              Encerrar
            </Button>
          </Stack>
        </Box>
      )}

      {/* Distraction Dialog */}
      <Dialog open={distractionOpen} onClose={() => setDistractionOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Anotar Interrupção</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="O que causou a interrupção?"
            value={distractionNote}
            onChange={(e) => setDistractionNote(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDistractionOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              recordInterruption(distractionNote);
              setDistractionNote('');
              setDistractionOpen(false);
            }}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={completeOpen} onClose={() => setCompleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Concluir Sessão de Foco</DialogTitle>
        <DialogContent>
          <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
            Parabéns pelo bloco de foco! Deseja salvar alguma reflexão ou nota sobre esta sessão?
          </Typography>
          <TextField
            label="Nota da sessão (opcional)"
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompleteOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              completeSession(sessionNote);
              setSessionNote('');
              setCompleteOpen(false);
            }}
          >
            Salvar e Concluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

