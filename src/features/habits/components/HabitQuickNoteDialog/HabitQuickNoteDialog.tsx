'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';
import type { Habit } from '../../types/habit.types';
import type { HabitLogContext } from '../../types/log.types';

export interface HabitQuickNoteDialogProps {
  open: boolean;
  habit: Habit | null;
  initialNote?: string;
  onClose: () => void;
  onSave: (note: string, context?: HabitLogContext) => Promise<void> | void;
}

const COMMON_TAGS = ['em-casa', 'trabalho', 'viagem', 'fim-de-semana', 'manhã', 'noite'];

export function HabitQuickNoteDialog({
  open,
  habit,
  initialNote = '',
  onClose,
  onSave,
}: HabitQuickNoteDialogProps) {
  const [note, setNote] = useState(initialNote);
  const [whatHelped, setWhatHelped] = useState('');
  const [whatHindered, setWhatHindered] = useState('');
  const [trigger, setTrigger] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const context: HabitLogContext = {
        whatHelped: whatHelped.trim() || undefined,
        whatHindered: whatHindered.trim() || undefined,
        trigger: trigger.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };
      await onSave(note.trim(), Object.keys(context).length > 0 ? context : undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="habit-quick-note-title"
    >
      <DialogTitle id="habit-quick-note-title">
        <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
          Adicionar Nota — {habit?.name}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Nota da ocorrência"
            placeholder="Como foi a realização deste hábito hoje?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {habit?.direction === 'reduce' && (
            <TextField
              fullWidth
              label="O que aconteceu antes? (Gatilho opcional)"
              placeholder="Ex: Tive uma reunião estressante..."
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              size="small"
            />
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="O que ajudou? (opcional)"
              placeholder="Ex: Deixei tudo preparado ontem"
              value={whatHelped}
              onChange={(e) => setWhatHelped(e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="O que dificultou? (opcional)"
              placeholder="Ex: Falta de tempo"
              value={whatHindered}
              onChange={(e) => setWhatHindered(e.target.value)}
              size="small"
            />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Tags de contexto:</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    clickable
                    color={isSelected ? 'primary' : 'default'}
                    onClick={() => toggleTag(tag)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                );
              })}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancelar
        </Button>
        <KokyuButton
          variant="contained"
          onClick={handleSave}
          disabled={isSubmitting || !note.trim()}
        >
          Salvar Nota
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
