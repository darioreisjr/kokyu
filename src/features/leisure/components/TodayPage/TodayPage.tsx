'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { leisureRoutes } from '../../constants/leisureRoutes';
import { useLeisureToday } from '../../hooks/useLeisureToday';
import type { LeisureItemFormValues } from '../../schemas/leisureItemSchema';
import type { QuickCaptureFormValues } from '../../schemas/quickCaptureSchema';
import { leisureItemService } from '../../services/leisureItemService';
import { leisurePlanService } from '../../services/leisurePlanService';
import { noteService } from '../../services/noteService';
import type { LeisureItem } from '../../types/leisureItem.types';
import type { LeisurePlanEntry } from '../../types/leisurePlan.types';
import { formatDuration } from '../../utils/durationFormat';
import { mapFormValuesToLeisureItemInput } from '../../utils/leisureItemFormMapper';
import { AddMenu, type AddMenuAction } from '../AddMenu/AddMenu';
import { LeisureItemCard } from '../LeisureItemCard/LeisureItemCard';
import { LeisureItemDialog } from '../LeisureItemDialog/LeisureItemDialog';
import { NoteDialog, type NoteDraft } from '../NoteDialog/NoteDialog';
import { QuickCaptureDialog } from '../QuickCaptureDialog/QuickCaptureDialog';
import { TimeAvailabilitySuggester } from '../TimeAvailabilitySuggester/TimeAvailabilitySuggester';

/**
 * `/app/tempo-livre` — planned-for-today, what's in progress, "O que
 * cabe agora?" and a small "Para depois" preview. Deliberately not a
 * statistics dashboard: priority stays on today's actual choices.
 */
export function TodayPage() {
  const { status, planEntries, inProgressItems, laterItems, allItems, reload } = useLeisureToday(
    new Date(),
  );
  const { showSuccess } = useSnackbar();

  const [addAction, setAddAction] = useState<AddMenuAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleQuickCapture(values: QuickCaptureFormValues) {
    setIsSubmitting(true);
    try {
      const type = (values.type || 'unsorted') as LeisureItem['type'];
      await leisureItemService.createLeisureItem({
        title: values.title,
        type,
        status: 'backlog',
        tags: [],
        favorite: false,
        durationType: 'unknown',
        sourceUrl: values.sourceUrl || undefined,
        description: values.notes || undefined,
        [type]: {},
      } as unknown as Parameters<typeof leisureItemService.createLeisureItem>[0]);
      showSuccess('Adicionado para depois.');
      setAddAction(null);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateNote(draft: NoteDraft) {
    setIsSubmitting(true);
    try {
      await noteService.createNote({
        title: draft.title || undefined,
        content: draft.content,
        type: draft.type,
        linkUrl: draft.type === 'link' ? draft.linkUrl : undefined,
        tags: draft.tags,
        checklistItems: draft.type === 'checklist' ? draft.checklistItems : undefined,
      });
      showSuccess('Nota salva.');
      setAddAction(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateItem(values: LeisureItemFormValues) {
    setIsSubmitting(true);
    try {
      await leisureItemService.createLeisureItem(mapFormValuesToLeisureItemInput(values));
      showSuccess('Item salvo.');
      setAddAction(null);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartItem(item: LeisureItem) {
    await leisureItemService.updateLeisureItem(item.id, { status: 'inProgress' } as Parameters<
      typeof leisureItemService.updateLeisureItem
    >[1]);
    showSuccess('Atividade iniciada.');
    reload();
  }

  async function handleCompletePlanEntry(entry: LeisurePlanEntry) {
    // `occurrenceDate` — a daily/weekly entry's "hoje" row must only
    // complete today's occurrence, never the whole series.
    await leisurePlanService.completePlanEntry(entry.id, entry.occurrenceDate);
    showSuccess('Planejamento concluído.');
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
            Tempo Livre
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Encontre espaço para aquilo que você gosta de fazer.
          </Typography>
        </Stack>
        <AddMenu onSelect={setAddAction} />
      </Stack>

      {status === 'loading' ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" height={160} />
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">Não foi possível carregar o seu dia agora. Tente novamente.</Alert>
      ) : null}

      {status === 'ready' ? (
        <>
          <Stack spacing={1.5}>
            <Typography variant="labelLarge">Planejado para hoje</Typography>
            {planEntries.length === 0 ? (
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                Nada planejado para hoje.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {planEntries.map((entry) => (
                  <Stack
                    key={entry.id}
                    direction="row"
                    spacing={2}
                    sx={(theme) => ({
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 2,
                      border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                      padding: 2,
                    })}
                  >
                    <Stack spacing={0.25}>
                      <Typography variant="labelLarge" component="p">
                        {entry.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                      >
                        {entry.startTime ? entry.startTime : 'Sem horário'}
                        {entry.duration ? ` · ${formatDuration(entry.duration)}` : ''}
                      </Typography>
                    </Stack>
                    <KokyuButton
                      variant={entry.completed ? 'text' : 'outlined'}
                      size="small"
                      disabled={entry.completed}
                      onClick={() => handleCompletePlanEntry(entry)}
                    >
                      {entry.completed ? 'Concluído' : 'Concluir'}
                    </KokyuButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>

          {inProgressItems.length > 0 ? (
            <Stack spacing={1.5}>
              <Typography variant="labelLarge">Em andamento</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {inProgressItems.map((item) => (
                  <LeisureItemCard key={item.id} item={item} />
                ))}
              </Box>
            </Stack>
          ) : null}

          <Stack spacing={1.5}>
            <Typography variant="labelLarge">O que cabe agora?</Typography>
            <TimeAvailabilitySuggester items={allItems} onStart={handleStartItem} />
          </Stack>

          {laterItems.length > 0 ? (
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="labelLarge">Para depois</Typography>
                <KokyuButton
                  variant="text"
                  size="small"
                  component={NextLink}
                  href={leisureRoutes.later}
                >
                  Ver tudo
                </KokyuButton>
              </Stack>
              <Stack spacing={1}>
                {laterItems.slice(0, 3).map((item) => (
                  <Typography key={item.id} variant="body2">
                    {item.title}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          ) : null}

          {planEntries.length === 0 && inProgressItems.length === 0 && laterItems.length === 0 ? (
            <EmptyState
              icon={CalendarMonthRoundedIcon}
              title="Nada planejado para hoje."
              action={
                <KokyuButton
                  variant="contained"
                  onClick={() => setAddAction({ kind: 'quick-capture' })}
                >
                  Encontrar algo para fazer
                </KokyuButton>
              }
            />
          ) : null}
        </>
      ) : null}

      <QuickCaptureDialog
        open={addAction?.kind === 'quick-capture'}
        onClose={() => setAddAction(null)}
        onSave={handleQuickCapture}
        isSubmitting={isSubmitting}
      />
      <NoteDialog
        open={addAction?.kind === 'note'}
        onClose={() => setAddAction(null)}
        onSave={handleCreateNote}
        isSubmitting={isSubmitting}
      />
      <LeisureItemDialog
        open={addAction?.kind === 'item'}
        lockedType={addAction?.kind === 'item' ? addAction.type : undefined}
        onClose={() => setAddAction(null)}
        onSave={handleCreateItem}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
