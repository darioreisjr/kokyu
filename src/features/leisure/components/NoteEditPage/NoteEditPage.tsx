'use client';

import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { useNote } from '../../hooks/useNote';
import { NoteFormPage } from '../NoteFormPage/NoteFormPage';

export interface NoteEditPageProps {
  noteId: string;
}

export function NoteEditPage({ noteId }: NoteEditPageProps) {
  const { status, note } = useNote(noteId);

  if (status === 'loading') {
    return (
      <Stack spacing={3} sx={{ maxWidth: 560 }}>
        <Skeleton variant="text" width={220} height={40} />
        <Skeleton variant="rounded" height={320} />
      </Stack>
    );
  }

  if (status === 'error' || !note) {
    return (
      <Alert severity="error">Não foi possível carregar esta nota agora. Tente novamente.</Alert>
    );
  }

  return <NoteFormPage mode="edit" initialNote={note} />;
}
