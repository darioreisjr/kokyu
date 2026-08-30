'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import type { ChecklistNoteItem, NoteType } from '../../types/note.types';

export interface NoteDraft {
  title: string;
  content: string;
  type: NoteType;
  linkUrl: string;
  tags: string[];
  checklistItems: ChecklistNoteItem[];
}

export interface NoteDialogProps {
  open: boolean;
  defaultValues?: Partial<NoteDraft>;
  onClose: () => void;
  onSave: (draft: NoteDraft) => void;
  isSubmitting?: boolean;
}

const typeOptions: { id: NoteType; label: string }[] = [
  { id: 'text', label: 'Texto' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'link', label: 'Link' },
  { id: 'idea', label: 'Ideia' },
];

function emptyDraft(): NoteDraft {
  return { title: '', content: '', type: 'text', linkUrl: '', tags: [], checklistItems: [] };
}

function makeChecklistItem(): ChecklistNoteItem {
  return {
    id: `check-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: '',
    checked: false,
  };
}

/** One dialog for text/checklist/link/idea notes — no Notion-style rich editor, just the fields each type actually needs. */
export function NoteDialog({
  open,
  defaultValues,
  onClose,
  onSave,
  isSubmitting,
}: NoteDialogProps) {
  const [draft, setDraft] = useState<NoteDraft>(emptyDraft);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setDraft({ ...emptyDraft(), ...defaultValues }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetting only when the dialog opens
  }, [open]);

  function updateItem(id: string, patch: Partial<ChecklistNoteItem>) {
    setDraft((current) => ({
      ...current,
      checklistItems: current.checklistItems.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    }));
  }

  function removeItem(id: string) {
    setDraft((current) => ({
      ...current,
      checklistItems: current.checklistItems.filter((entry) => entry.id !== id),
    }));
  }

  function moveItem(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const items = [...current.checklistItems];
      const target = index + direction;
      if (target < 0 || target >= items.length) return current;
      [items[index], items[target]] = [items[target]!, items[index]!];
      return { ...current, checklistItems: items };
    });
  }

  const canSubmit =
    draft.type === 'checklist'
      ? Boolean(draft.title.trim()) || draft.checklistItems.length > 0
      : Boolean(draft.content.trim()) || Boolean(draft.title.trim());

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="note-dialog-title"
    >
      <DialogTitle id="note-dialog-title">
        {defaultValues ? 'Editar nota' : 'Nova nota'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ marginTop: 1 }}>
          <KokyuTextField
            select
            label="Tipo"
            value={draft.type}
            onChange={(event) =>
              setDraft((current) => ({ ...current, type: event.target.value as NoteType }))
            }
          >
            {typeOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </KokyuTextField>
          <KokyuTextField
            label="Título (opcional)"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            autoFocus
          />

          {draft.type === 'link' ? (
            <KokyuTextField
              label="Link"
              value={draft.linkUrl}
              onChange={(event) =>
                setDraft((current) => ({ ...current, linkUrl: event.target.value }))
              }
            />
          ) : null}

          {draft.type !== 'checklist' ? (
            <KokyuTextField
              label="Conteúdo"
              multiline
              minRows={3}
              value={draft.content}
              onChange={(event) =>
                setDraft((current) => ({ ...current, content: event.target.value }))
              }
            />
          ) : (
            <Stack spacing={1.5}>
              <KokyuTextField
                label="Descrição (opcional)"
                multiline
                minRows={1}
                value={draft.content}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, content: event.target.value }))
                }
              />
              {draft.checklistItems.map((item, index) => (
                <Stack key={item.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Checkbox
                    checked={item.checked}
                    onChange={(event) => updateItem(item.id, { checked: event.target.checked })}
                    slotProps={{
                      input: { 'aria-label': `Marcar ${item.text || 'item'} como concluído` },
                    }}
                  />
                  <KokyuTextField
                    label={`Item ${index + 1}`}
                    value={item.text}
                    onChange={(event) => updateItem(item.id, { text: event.target.value })}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    aria-label="Mover item para cima"
                    size="small"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                  >
                    <ArrowUpwardRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Mover item para baixo"
                    size="small"
                    disabled={index === draft.checklistItems.length - 1}
                    onClick={() => moveItem(index, 1)}
                  >
                    <ArrowDownwardRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Remover item"
                    size="small"
                    onClick={() => removeItem(item.id)}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <KokyuButton
                variant="text"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    checklistItems: [...current.checklistItems, makeChecklistItem()],
                  }))
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                Adicionar item
              </KokyuButton>
            </Stack>
          )}

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={draft.tags}
            onChange={(_event, value) =>
              setDraft((current) => ({ ...current, tags: value as string[] }))
            }
            renderInput={(params) => <KokyuTextField {...params} label="Tags (opcional)" />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          variant="contained"
          disabled={!canSubmit}
          loading={isSubmitting}
          onClick={() => onSave(draft)}
        >
          Salvar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
