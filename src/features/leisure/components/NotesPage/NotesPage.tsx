'use client';

import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useNotes } from '../../hooks/useNotes';
import { noteService } from '../../services/noteService';
import type { Note } from '../../types/note.types';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { NoteDialog, type NoteDraft } from '../NoteDialog/NoteDialog';
import { NoteCard } from './NoteCard';

/** `/app/tempo-livre/notas` — texto/checklist/link/ideia, independent notes or ones related to a `LeisureItem` by id (never a copy of that item's content). */
export function NotesPage() {
  const { status, notes, items, reload } = useNotes();
  const { showSuccess } = useSnackbar();
  const confirmAction = useConfirmAction();

  const [dialogTarget, setDialogTarget] = useState<{
    id?: string;
    defaultValues?: NoteDraft;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const visibleNotes = notes.filter((note) => !note.archived);
  const sortedNotes = [...visibleNotes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  async function handleSave(draft: NoteDraft) {
    setIsSubmitting(true);
    try {
      if (dialogTarget?.id) {
        await noteService.updateNote(dialogTarget.id, {
          title: draft.title || undefined,
          content: draft.content,
          type: draft.type,
          linkUrl: draft.type === 'link' ? draft.linkUrl : undefined,
          tags: draft.tags,
          checklistItems: draft.type === 'checklist' ? draft.checklistItems : undefined,
        });
        showSuccess('Nota atualizada.');
      } else {
        await noteService.createNote({
          title: draft.title || undefined,
          content: draft.content,
          type: draft.type,
          linkUrl: draft.type === 'link' ? draft.linkUrl : undefined,
          tags: draft.tags,
          checklistItems: draft.type === 'checklist' ? draft.checklistItems : undefined,
        });
        showSuccess('Nota salva.');
      }
      setDialogTarget(null);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTogglePin(note: Note) {
    await noteService.togglePin(note.id);
    reload();
  }

  async function handleArchive(note: Note) {
    await noteService.archiveNote(note.id);
    showSuccess('Nota arquivada.');
    reload();
  }

  function handleDelete(note: Note) {
    confirmAction.request({
      title: 'Excluir nota?',
      description: 'Esta nota será removida permanentemente.',
      confirmLabel: 'Excluir',
      onConfirm: () => {
        noteService.deleteNote(note.id).then(() => {
          showSuccess('Nota excluída.');
          reload();
        });
      },
    });
  }

  async function handleToggleChecklistItem(noteId: string, checklistItemId: string) {
    await noteService.toggleChecklistItem(noteId, checklistItemId);
    reload();
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
          onClick={() => setDialogTarget({})}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Nova nota
        </KokyuButton>
      </Stack>

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={140} />
          ))}
        </Box>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">Não foi possível carregar suas notas agora. Tente novamente.</Alert>
      ) : null}

      {status === 'ready' && sortedNotes.length === 0 ? (
        <EmptyState
          icon={NoteAltOutlinedIcon}
          title="Guarde ideias, recomendações e coisas que você não quer esquecer."
          action={
            <KokyuButton variant="contained" onClick={() => setDialogTarget({})}>
              Nova nota
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' && sortedNotes.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              relatedItemTitle={
                note.relatedEntity ? itemsById.get(note.relatedEntity.entityId)?.title : undefined
              }
              onEdit={() =>
                setDialogTarget({
                  id: note.id,
                  defaultValues: {
                    title: note.title ?? '',
                    content: note.content,
                    type: note.type,
                    linkUrl: note.linkUrl ?? '',
                    tags: note.tags,
                    checklistItems: note.checklistItems ?? [],
                  },
                })
              }
              onTogglePin={() => handleTogglePin(note)}
              onArchive={() => handleArchive(note)}
              onDelete={() => handleDelete(note)}
              onToggleChecklistItem={(checklistItemId) =>
                handleToggleChecklistItem(note.id, checklistItemId)
              }
            />
          ))}
        </Box>
      ) : null}

      <NoteDialog
        open={Boolean(dialogTarget)}
        defaultValues={dialogTarget?.defaultValues}
        onClose={() => setDialogTarget(null)}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
