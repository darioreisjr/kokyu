'use client';

import Stack from '@mui/material/Stack';
import { useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

export interface NoteFormStepProps {
  onCancel: () => void;
  onConfirm: (note: string) => void;
}

const noteSuggestions = ['Almoçar fora', 'Restaurante', 'Sobras de ontem', 'Livre'];

/** A meal that isn't a recipe or a tracked food — "Almoçar fora", "Livre" — so nothing forces a recipe to exist for every slot. */
export function NoteFormStep({ onCancel, onConfirm }: NoteFormStepProps) {
  const [note, setNote] = useState('');

  return (
    <Stack spacing={2.5}>
      <KokyuTextField
        label="Anotação"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        autoFocus
        multiline
        minRows={2}
      />
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {noteSuggestions.map((suggestion) => (
          <KokyuButton
            key={suggestion}
            variant="outlined"
            size="small"
            onClick={() => setNote(suggestion)}
          >
            {suggestion}
          </KokyuButton>
        ))}
      </Stack>
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <KokyuButton variant="text" onClick={onCancel}>
          Voltar
        </KokyuButton>
        <KokyuButton
          variant="contained"
          disabled={!note.trim()}
          onClick={() => onConfirm(note.trim())}
        >
          Adicionar
        </KokyuButton>
      </Stack>
    </Stack>
  );
}
