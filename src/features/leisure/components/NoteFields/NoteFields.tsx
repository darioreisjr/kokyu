'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import type { Dispatch, SetStateAction } from 'react';

import { KokyuButton, KokyuTagsField, KokyuTextField } from '@/design-system/components';
import { useTagSuggestions } from '@/shared/tags/useTagSuggestions';

import { noteService } from '../../services/noteService';
import type { ChecklistNoteItem, NoteType } from '../../types/note.types';

export interface NoteDraft {
  title: string;
  content: string;
  type: NoteType;
  linkUrl: string;
  tags: string[];
  checklistItems: ChecklistNoteItem[];
}

const typeOptions: { id: NoteType; label: string }[] = [
  { id: 'text', label: 'Texto' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'link', label: 'Link' },
  { id: 'idea', label: 'Ideia' },
];

export function emptyNoteDraft(): NoteDraft {
  return { title: '', content: '', type: 'text', linkUrl: '', tags: [], checklistItems: [] };
}

/** A checklist needs a title or at least one item; every other type needs a title or some content. */
export function canSubmitNoteDraft(draft: NoteDraft): boolean {
  return draft.type === 'checklist'
    ? Boolean(draft.title.trim()) || draft.checklistItems.length > 0
    : Boolean(draft.content.trim()) || Boolean(draft.title.trim());
}

async function loadNoteTags(): Promise<string[]> {
  const notes = await noteService.getNotes();
  return notes.flatMap((note) => note.tags);
}

function makeChecklistItem(): ChecklistNoteItem {
  return {
    id: `check-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: '',
    checked: false,
  };
}

export interface NoteFieldsProps {
  draft: NoteDraft;
  setDraft: Dispatch<SetStateAction<NoteDraft>>;
  autoFocus?: boolean;
}

/** The text/checklist/link/idea note fields — shared by `NoteDialog` and `NoteFormPage`, so both edit the exact same shape. */
export function NoteFields({ draft, setDraft, autoFocus }: NoteFieldsProps) {
  const tagSuggestions = useTagSuggestions(loadNoteTags);

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

  return (
    <Stack spacing={2.5}>
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
        autoFocus={autoFocus}
      />

      {draft.type === 'link' ? (
        <KokyuTextField
          label="Link"
          value={draft.linkUrl}
          onChange={(event) => setDraft((current) => ({ ...current, linkUrl: event.target.value }))}
        />
      ) : null}

      {draft.type !== 'checklist' ? (
        <KokyuTextField
          label="Conteúdo"
          multiline
          minRows={3}
          value={draft.content}
          onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
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

      <KokyuTagsField
        value={draft.tags}
        onChange={(tags) => setDraft((current) => ({ ...current, tags }))}
        suggestions={tagSuggestions}
      />
    </Stack>
  );
}
