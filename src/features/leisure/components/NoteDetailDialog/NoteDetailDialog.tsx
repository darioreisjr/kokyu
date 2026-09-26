'use client';

import PushPinIcon from '@mui/icons-material/PushPin';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { leisureRoutes } from '../../constants/leisureRoutes';
import type { Note } from '../../types/note.types';

const typeLabel: Record<Note['type'], string> = {
  text: 'Texto',
  checklist: 'Checklist',
  link: 'Link',
  idea: 'Ideia',
};

function formatTimestamp(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack spacing={0.25}>
      <Typography
        variant="labelSmall"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {label}
      </Typography>
      {typeof children === 'string' ? (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </Stack>
  );
}

export interface NoteDetailDialogProps {
  /** `null` keeps the dialog closed — no separate `open` prop, so there's never a stale note visible mid-close animation. */
  note: Note | null;
  relatedItemTitle?: string;
  onClose: () => void;
  onToggleChecklistItem: (checklistItemId: string) => void;
  /** Required when `note` can be archived (the Arquivadas view) — omit from a context that only ever shows active notes. */
  onUnarchive?: (note: Note) => void;
}

/**
 * Read view for a note card — clicking a card opens this, never the edit
 * page directly (same as `PlanEntryDetailDialog` on Planejamento). The
 * only in-place change it allows is checking checklist items, same as
 * the card itself. An archived note swaps "Editar" for "Desarquivar" and
 * keeps its checklist read-only — it has to come back first.
 */
export function NoteDetailDialog({
  note,
  relatedItemTitle,
  onClose,
  onToggleChecklistItem,
  onUnarchive,
}: NoteDetailDialogProps) {
  return (
    <Dialog
      open={Boolean(note)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="note-detail-title"
    >
      <DialogTitle id="note-detail-title">
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <span>{note?.title || typeLabel[note?.type ?? 'text']}</span>
          {note?.pinned ? (
            <PushPinIcon
              fontSize="small"
              aria-hidden
              sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.warning })}
            />
          ) : null}
        </Stack>
      </DialogTitle>
      <DialogContent>
        {note ? (
          <Stack spacing={2}>
            <DetailRow label="Tipo">{typeLabel[note.type]}</DetailRow>
            {relatedItemTitle ? (
              <DetailRow label="Relacionada a">{relatedItemTitle}</DetailRow>
            ) : null}

            {note.type === 'link' && note.linkUrl ? (
              <DetailRow label="Link">
                <Typography
                  variant="body1"
                  component="a"
                  href={note.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {note.linkUrl}
                </Typography>
              </DetailRow>
            ) : null}

            {note.content ? (
              <DetailRow label={note.type === 'checklist' ? 'Descrição' : 'Conteúdo'}>
                {note.content}
              </DetailRow>
            ) : null}

            {note.type === 'checklist' ? (
              <DetailRow label="Itens">
                {(note.checklistItems ?? []).length > 0 ? (
                  <Stack spacing={0.25}>
                    {(note.checklistItems ?? []).map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                      >
                        <Checkbox
                          size="small"
                          checked={item.checked}
                          disabled={note.archived}
                          onChange={() => onToggleChecklistItem(item.id)}
                          slotProps={{
                            input: { 'aria-label': `Marcar ${item.text} como concluído` },
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{ textDecoration: item.checked ? 'line-through' : 'none' }}
                        >
                          {item.text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body1">Nenhum item.</Typography>
                )}
              </DetailRow>
            ) : null}

            {note.tags.length > 0 ? (
              <DetailRow label="Tags">
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                  {note.tags.map((tag) => (
                    <Chip key={tag} size="small" label={tag} />
                  ))}
                </Stack>
              </DetailRow>
            ) : null}

            {note.archived ? <DetailRow label="Status">Arquivada</DetailRow> : null}
            <DetailRow label="Fixada">{note.pinned ? 'Sim' : 'Não'}</DetailRow>
            <DetailRow label="Criada em">{formatTimestamp(note.createdAt)}</DetailRow>
            <DetailRow label="Atualizada em">{formatTimestamp(note.updatedAt)}</DetailRow>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Fechar
        </KokyuButton>
        {note?.archived ? (
          <KokyuButton variant="contained" onClick={() => onUnarchive?.(note)}>
            Desarquivar
          </KokyuButton>
        ) : note ? (
          <KokyuButton
            variant="contained"
            component={NextLink}
            href={leisureRoutes.noteEdit(note.id)}
          >
            Editar
          </KokyuButton>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
