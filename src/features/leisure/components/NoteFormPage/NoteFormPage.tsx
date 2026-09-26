'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { friendlyErrorMessage } from '@/lib/api/errors';

import { leisureRoutes } from '../../constants/leisureRoutes';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { noteService } from '../../services/noteService';
import type { Note } from '../../types/note.types';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import {
  canSubmitNoteDraft,
  emptyNoteDraft,
  NoteFields,
  type NoteDraft,
} from '../NoteFields/NoteFields';

function mapNoteToDraft(note: Note): NoteDraft {
  return {
    title: note.title ?? '',
    content: note.content,
    type: note.type,
    linkUrl: note.linkUrl ?? '',
    tags: note.tags,
    checklistItems: note.checklistItems ?? [],
  };
}

export interface NoteFormPageProps {
  mode: 'create' | 'edit';
  /** Required in `edit` — the note being edited. */
  initialNote?: Note;
}

/**
 * `/app/tempo-livre/notas/nova` and `.../[id]/editar` — a full page
 * rather than `NoteDialog`'s modal for the Notas screen's own flow. The
 * other note entry points (Hoje's "Adicionar → Nota", item detail) keep
 * the modal. In `edit`, Arquivar/Excluir live here (not on the card),
 * both behind a confirmation.
 */
export function NoteFormPage({ mode, initialNote }: NoteFormPageProps) {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [draft, setDraft] = useState<NoteDraft>(() =>
    initialNote ? mapNoteToDraft(initialNote) : emptyNoteDraft(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<'archive' | 'delete' | null>(null);
  const confirmAction = useConfirmAction();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input = {
      title: draft.title || undefined,
      content: draft.content,
      type: draft.type,
      linkUrl: draft.type === 'link' ? draft.linkUrl : undefined,
      tags: draft.tags,
      checklistItems: draft.type === 'checklist' ? draft.checklistItems : undefined,
    };

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && initialNote) {
        await noteService.updateNote(initialNote.id, input);
        showSuccess('Nota atualizada.');
      } else {
        await noteService.createNote(input);
        showSuccess('Nota salva.');
      }
      router.push(leisureRoutes.notes);
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível salvar a nota agora.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function runNoteAction(action: 'archive' | 'delete', note: Note) {
    setPendingAction(action);
    try {
      if (action === 'archive') {
        await noteService.archiveNote(note.id);
        showSuccess('Nota arquivada. Você pode desarquivá-la em Notas → Arquivadas.');
      } else {
        await noteService.deleteNote(note.id);
        showSuccess('Nota excluída.');
      }
      router.push(leisureRoutes.notes);
    } catch (error) {
      showError(
        friendlyErrorMessage(
          error,
          action === 'archive'
            ? 'Não foi possível arquivar agora.'
            : 'Não foi possível excluir agora.',
        ),
      );
    } finally {
      setPendingAction(null);
    }
  }

  function handleArchive() {
    if (!initialNote) return;
    confirmAction.request({
      title: 'Arquivar nota?',
      description: 'Ela sai da lista de Notas e fica em Arquivadas, de onde pode ser desarquivada.',
      confirmLabel: 'Arquivar',
      onConfirm: () => runNoteAction('archive', initialNote),
    });
  }

  function handleDelete() {
    if (!initialNote) return;
    confirmAction.request({
      title: 'Excluir nota?',
      description: 'Esta nota será removida permanentemente.',
      confirmLabel: 'Excluir',
      onConfirm: () => runNoteAction('delete', initialNote),
    });
  }

  const isEdit = mode === 'edit' && Boolean(initialNote);
  const isBusy = isSubmitting || pendingAction !== null;

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit} noValidate>
      <Typography variant="displaySmall" component="h1">
        {mode === 'edit' ? 'Editar nota' : 'Nova nota'}
      </Typography>

      {/* `alignSelf` (not `mx: 'auto'`) — see the same note in `PlanEntryFormPage`. */}
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <NoteFields draft={draft} setDraft={setDraft} autoFocus={mode === 'create'} />

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            justifyContent: isEdit ? 'space-between' : 'flex-end',
            flexWrap: 'wrap',
            rowGap: 1,
          }}
        >
          {isEdit ? (
            <Stack direction="row" spacing={1}>
              {!initialNote?.archived ? (
                <KokyuButton
                  variant="text"
                  loading={pendingAction === 'archive'}
                  disabled={isBusy}
                  onClick={handleArchive}
                >
                  Arquivar
                </KokyuButton>
              ) : null}
              <KokyuButton
                variant="text"
                color="error"
                loading={pendingAction === 'delete'}
                disabled={isBusy}
                onClick={handleDelete}
              >
                Excluir
              </KokyuButton>
            </Stack>
          ) : null}
          <Stack direction="row" spacing={1.5}>
            <KokyuButton variant="text" onClick={() => router.push(leisureRoutes.notes)}>
              Cancelar
            </KokyuButton>
            <KokyuButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={!canSubmitNoteDraft(draft) || isBusy}
            >
              Salvar
            </KokyuButton>
          </Stack>
        </Stack>
      </Stack>

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
