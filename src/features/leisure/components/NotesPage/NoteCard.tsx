'use client';

import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import type { Note } from '../../types/note.types';

const typeLabel: Record<Note['type'], string> = {
  text: 'Texto',
  checklist: 'Checklist',
  link: 'Link',
  idea: 'Ideia',
};

export interface NoteCardProps {
  note: Note;
  relatedItemTitle?: string;
  onEdit: () => void;
  onTogglePin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onToggleChecklistItem: (checklistItemId: string) => void;
}

/** Text/checklist/link/idea, all one shape — the type only changes which body renders, never a separate note system per type. */
export function NoteCard({
  note,
  relatedItemTitle,
  onEdit,
  onTogglePin,
  onArchive,
  onDelete,
  onToggleChecklistItem,
}: NoteCardProps) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${note.pinned ? themePalette(theme).kokyu.border.focus : themePalette(theme).kokyu.border.subtle}`,
        padding: 2,
      })}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
            {note.title ? (
              <Typography
                variant="labelLarge"
                component="p"
                noWrap
                sx={{ cursor: 'pointer' }}
                onClick={onEdit}
              >
                {note.title}
              </Typography>
            ) : null}
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: themePalette(theme).kokyu.text.secondary,
                cursor: 'pointer',
              })}
              onClick={onEdit}
            >
              {typeLabel[note.type]}
              {relatedItemTitle ? ` · ${relatedItemTitle}` : ''}
            </Typography>
          </Stack>
          <IconButton
            aria-label={note.pinned ? 'Desafixar nota' : 'Fixar nota'}
            size="small"
            onClick={onTogglePin}
          >
            {note.pinned ? (
              <PushPinIcon
                fontSize="small"
                sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.warning })}
              />
            ) : (
              <PushPinOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Stack>

        {note.type === 'checklist' ? (
          <Stack spacing={0.5}>
            {note.content ? (
              <Typography variant="body2" sx={{ cursor: 'pointer' }} onClick={onEdit}>
                {note.content}
              </Typography>
            ) : null}
            {(note.checklistItems ?? []).map((item) => (
              <Stack key={item.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Checkbox
                  size="small"
                  checked={item.checked}
                  onChange={() => onToggleChecklistItem(item.id)}
                  slotProps={{ input: { 'aria-label': `Marcar ${item.text} como concluído` } }}
                />
                <Typography
                  variant="body2"
                  sx={{ textDecoration: item.checked ? 'line-through' : 'none' }}
                >
                  {item.text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : note.type === 'link' ? (
          <Typography
            variant="body2"
            component="a"
            href={note.linkUrl}
            target="_blank"
            rel="noreferrer"
          >
            {note.linkUrl}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ cursor: 'pointer' }} onClick={onEdit}>
            {note.content}
          </Typography>
        )}

        {note.tags.length > 0 ? (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
            {note.tags.map((tag) => (
              <Chip key={tag} size="small" label={tag} />
            ))}
          </Stack>
        ) : null}

        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton aria-label="Arquivar nota" size="small" onClick={onArchive}>
            <ArchiveOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="Excluir nota" size="small" onClick={onDelete}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
