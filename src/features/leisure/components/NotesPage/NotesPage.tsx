'use client';

import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { friendlyErrorMessage } from '@/lib/api/errors';

import { leisureRoutes } from '../../constants/leisureRoutes';
import { useNotes } from '../../hooks/useNotes';
import { noteService } from '../../services/noteService';
import type { Note } from '../../types/note.types';
import { NoteDetailDialog } from '../NoteDetailDialog/NoteDetailDialog';
import { NoteCard } from './NoteCard';

type ViewMode = 'active' | 'archived';

const gridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
  gap: 2,
} as const;

/**
 * `/app/tempo-livre/notas` — texto/checklist/link/ideia, independent notes
 * or ones related to a `LeisureItem` by id (never a copy of that item's
 * content). Arquivar/Excluir live on the edit page, not the card; the
 * Arquivadas view is the only way back for an archived note.
 */
export function NotesPage() {
  const { status, notes, items, reload } = useNotes();
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  // Held by id, not by value, so a checklist toggle made inside the dialog
  // shows up there as soon as `reload()` brings the updated note back.
  const [detailNoteId, setDetailNoteId] = useState<string | null>(null);

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const visibleNotes = notes.filter((note) => note.archived === (viewMode === 'archived'));
  const sortedNotes =
    viewMode === 'active'
      ? [...visibleNotes].sort((a, b) => Number(b.pinned) - Number(a.pinned))
      : visibleNotes;
  const detailNote = detailNoteId ? (notes.find((note) => note.id === detailNoteId) ?? null) : null;

  function relatedItemTitleOf(note: Note): string | undefined {
    return note.relatedEntity ? itemsById.get(note.relatedEntity.entityId)?.title : undefined;
  }

  async function handleTogglePin(note: Note) {
    await noteService.togglePin(note.id);
    reload();
  }

  async function handleToggleChecklistItem(noteId: string, checklistItemId: string) {
    await noteService.toggleChecklistItem(noteId, checklistItemId);
    reload();
  }

  function handleUnarchive(note: Note) {
    noteService
      .unarchiveNote(note.id)
      .then(() => {
        showSuccess('Nota desarquivada.');
        setDetailNoteId(null);
        reload();
      })
      .catch((error) => {
        showError(friendlyErrorMessage(error, 'Não foi possível desarquivar agora.'));
      });
  }

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Notas
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Guarde ideias, recomendações e coisas que você não quer esquecer.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          onClick={() => router.push(leisureRoutes.noteNew)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Nova nota
        </KokyuButton>
      </Stack>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(_event, next: ViewMode | null) => next && setViewMode(next)}
        size="small"
        aria-label="Visualização"
        sx={{ alignSelf: 'flex-start' }}
      >
        <ToggleButton value="active" sx={{ textTransform: 'none' }}>
          Ativas
        </ToggleButton>
        <ToggleButton value="archived" sx={{ textTransform: 'none' }}>
          Arquivadas
        </ToggleButton>
      </ToggleButtonGroup>

      {status === 'loading' ? (
        <Box sx={gridSx}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={140} />
          ))}
        </Box>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">Não foi possível carregar suas notas agora. Tente novamente.</Alert>
      ) : null}

      {status === 'ready' && sortedNotes.length === 0 ? (
        viewMode === 'active' ? (
          <EmptyState
            icon={NoteAltOutlinedIcon}
            title="Guarde ideias, recomendações e coisas que você não quer esquecer."
            action={
              <KokyuButton variant="contained" onClick={() => router.push(leisureRoutes.noteNew)}>
                Nova nota
              </KokyuButton>
            }
          />
        ) : (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Nenhuma nota arquivada.
          </Typography>
        )
      ) : null}

      {status === 'ready' && sortedNotes.length > 0 ? (
        <Box sx={gridSx}>
          {sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              relatedItemTitle={relatedItemTitleOf(note)}
              onOpenDetails={() => setDetailNoteId(note.id)}
              onTogglePin={note.archived ? undefined : () => handleTogglePin(note)}
              onToggleChecklistItem={(checklistItemId) =>
                handleToggleChecklistItem(note.id, checklistItemId)
              }
            />
          ))}
        </Box>
      ) : null}

      <NoteDetailDialog
        note={detailNote}
        relatedItemTitle={detailNote ? relatedItemTitleOf(detailNote) : undefined}
        onClose={() => setDetailNoteId(null)}
        onToggleChecklistItem={(checklistItemId) =>
          detailNote ? handleToggleChecklistItem(detailNote.id, checklistItemId) : undefined
        }
        onUnarchive={handleUnarchive}
      />
    </Stack>
  );
}
