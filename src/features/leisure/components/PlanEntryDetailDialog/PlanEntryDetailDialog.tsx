'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { leisureRoutes } from '../../constants/leisureRoutes';
import type { LeisurePlanEntry, LeisureRecurrence } from '../../types/leisurePlan.types';
import { formatDateHeading, fromDateKey } from '../../utils/dateHelpers';
import { formatDuration, formatTime } from '../../utils/durationFormat';

const recurrenceLabels: Record<LeisureRecurrence, string> = {
  none: 'Não repetir',
  daily: 'Diariamente',
  weekly: 'Semanalmente',
  custom: 'Personalizado',
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography
        variant="labelSmall"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  );
}

export interface PlanEntryDetailDialogProps {
  /** `null` keeps the dialog closed — no separate `open` prop, so there's never a stale entry visible mid-close animation. */
  entry: LeisurePlanEntry | null;
  onClose: () => void;
  /** Required when `entry` can be archived (the Arquivados list) — omit from a context that only ever shows active entries. */
  onUnarchive?: (entry: LeisurePlanEntry) => void;
}

/**
 * Read-only "what is this?" view for a planner card — clicking a card
 * opens this, never the edit page directly, so a glance doesn't risk an
 * accidental change. An archived entry swaps "Editar" for "Desarquivar"
 * instead — editing is never offered for something archived, only
 * bringing it back first.
 */
export function PlanEntryDetailDialog({ entry, onClose, onUnarchive }: PlanEntryDetailDialogProps) {
  return (
    <Dialog
      open={Boolean(entry)}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="plan-entry-detail-title"
    >
      <DialogTitle id="plan-entry-detail-title">{entry?.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DetailRow
            label="Dia"
            value={entry ? formatDateHeading(fromDateKey(entry.occurrenceDate)) : ''}
          />
          <DetailRow
            label="Horário"
            value={
              entry?.startTime
                ? `${formatTime(entry.startTime)}${entry.endTime ? ` – ${formatTime(entry.endTime)}` : ''}`
                : 'Sem horário'
            }
          />
          {entry?.duration ? <DetailRow label="Duração" value={formatDuration(entry.duration)} /> : null}
          <DetailRow label="Recorrência" value={recurrenceLabels[entry?.recurrence ?? 'none']} />
          {entry?.notes ? <DetailRow label="Notas" value={entry.notes} /> : null}
          <DetailRow
            label="Status"
            value={entry?.archived ? 'Arquivado' : entry?.completed ? 'Concluído' : 'Pendente'}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Fechar
        </KokyuButton>
        {entry?.archived ? (
          <KokyuButton variant="contained" onClick={() => onUnarchive?.(entry)}>
            Desarquivar
          </KokyuButton>
        ) : entry ? (
          <KokyuButton
            variant="contained"
            component={NextLink}
            href={leisureRoutes.planEdit(entry.id)}
          >
            Editar
          </KokyuButton>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
