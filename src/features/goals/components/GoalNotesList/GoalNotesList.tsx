'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import type { GoalNote } from '../../types';
import { formatShortDateTime } from '../../utils/dateHelpers';

export interface GoalNotesListProps {
  notes: GoalNote[];
  onAdd: (text: string) => void;
}

/** Notas simples — texto e data, sem editor rico (ver a spec: "não criar editor complexo"). */
export function GoalNotesList({ notes, onAdd }: GoalNotesListProps) {
  const [text, setText] = useState('');

  function handleAdd() {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge">Notas</Typography>
      <Stack spacing={1}>
        {notes.map((note) => (
          <Stack
            key={note.id}
            spacing={0.25}
            sx={(theme) => ({
              padding: 1.5,
              borderRadius: 1.5,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            })}
          >
            <Typography variant="body2">{note.text}</Typography>
            <Typography
              variant="labelSmall"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {formatShortDateTime(note.createdAt)}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Stack direction="row" spacing={1}>
        <KokyuTextField
          label="Nova nota"
          value={text}
          onChange={(event) => setText(event.target.value)}
          multiline
          minRows={2}
          sx={{ flex: 1 }}
        />
        <KokyuButton variant="outlined" onClick={handleAdd}>
          Adicionar
        </KokyuButton>
      </Stack>
    </Stack>
  );
}
