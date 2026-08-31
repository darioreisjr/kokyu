'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import type { ScheduleEntry, ScheduleEntryInput, ScheduleSourceType } from '@/shared/scheduling/types';

export interface ScheduleEntryModalProps {
  open: boolean;
  onClose: () => void;
  initialDate: string;
  entryToEdit?: ScheduleEntry | null;
  onSave: (entry: ScheduleEntryInput) => Promise<void>;
}

export function ScheduleEntryModal({
  open,
  onClose,
  initialDate,
  entryToEdit,
  onSave,
}: ScheduleEntryModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate);
  const [startAt, setStartAt] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [sourceType, setSourceType] = useState<ScheduleSourceType>('manual');
  const [locked, setLocked] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'focus'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setTitle(entryToEdit.title);
      setDescription(entryToEdit.description || '');
      setDate(entryToEdit.date);
      setStartAt(entryToEdit.startAt || '09:00');
      setDuration(entryToEdit.duration);
      setSourceType(entryToEdit.sourceType);
      setLocked(entryToEdit.locked ?? false);
      setPriority(entryToEdit.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setDate(initialDate);
      setStartAt('09:00');
      setDuration(60);
      setSourceType('manual');
      setLocked(false);
      setPriority('medium');
    }
  }, [entryToEdit, initialDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: entryToEdit?.id,
        sourceType,
        sourceId: entryToEdit?.sourceId || `manual-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        startAt,
        duration,
        locked,
        priority,
        status: entryToEdit?.status || 'planned',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="schedule-entry-title">
      <DialogTitle
        id="schedule-entry-title"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {entryToEdit ? 'Editar Entrada na Agenda' : 'Nova Entrada na Agenda'}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              size="small"
              autoFocus
            />

            <Stack direction="row" spacing={2}>
              <TextField
                type="date"
                label="Data"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                type="time"
                label="Horário de início"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                type="number"
                label="Duração (min)"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 5, step: 5 } }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel id="entry-source-label">Tipo de entrada</InputLabel>
                <Select
                  labelId="entry-source-label"
                  label="Tipo de entrada"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                >
                  <MenuItem value="manual">Compromisso Manual</MenuItem>
                  <MenuItem value="focus">Bloco de Foco</MenuItem>
                  <MenuItem value="break">Pausa / Respiro</MenuItem>
                  <MenuItem value="travel">Deslocamento</MenuItem>
                  <MenuItem value="blockedTime">Horário Indisponível</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel id="entry-priority-label">Prioridade</InputLabel>
                <Select
                  labelId="entry-priority-label"
                  label="Prioridade"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <MenuItem value="low">Baixa</MenuItem>
                  <MenuItem value="medium">Média</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="focus">Foco do Dia</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <FormControlLabel
              control={<Checkbox checked={locked} onChange={(e) => setLocked(e.target.checked)} />}
              label="Compromisso fixo (não reorganizar automaticamente)"
            />

            <TextField
              label="Notas / Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button variant="text" onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || !title.trim()}
            sx={{ textTransform: 'none', px: 3 }}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

