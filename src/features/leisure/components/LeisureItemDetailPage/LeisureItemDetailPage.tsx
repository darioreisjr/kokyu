'use client';

import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TheaterComedyRoundedIcon from '@mui/icons-material/TheaterComedyRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getLeisureItemTypeLabel } from '../../constants/leisureItemTypes';
import { leisureRoutes } from '../../constants/leisureRoutes';
import { getStatusLabel } from '../../constants/leisureStatuses';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { collectionService } from '../../services/collectionService';
import { leisureItemService } from '../../services/leisureItemService';
import { historyService } from '../../services/historyService';
import { leisurePlanService } from '../../services/leisurePlanService';
import { noteService } from '../../services/noteService';
import type { LeisureCollection } from '../../types/collection.types';
import type { LeisureItem } from '../../types/leisureItem.types';
import type { Note } from '../../types/note.types';
import { toDateKey } from '../../utils/dateHelpers';
import { formatDuration } from '../../utils/durationFormat';
import { getEffectiveDuration } from '../../utils/suggestionEngine';
import {
  mapFormValuesToLeisureItemPatch,
  mapLeisureItemToFormValues,
} from '../../utils/leisureItemFormMapper';
import { getLeisureItemProgress } from '../../utils/progress';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { LeisureItemDialog } from '../LeisureItemDialog/LeisureItemDialog';
import { LogEntryDialog, type LogEntryDraft } from '../LogEntryDialog/LogEntryDialog';
import { NoteDialog, type NoteDraft } from '../NoteDialog/NoteDialog';
import type { LeisureItemFormValues } from '../../schemas/leisureItemSchema';
import type { PlanEntryFormValues } from '../../schemas/planEntrySchema';
import { PlanEntryDialog } from '../PlanEntryDialog/PlanEntryDialog';
import { AddToCollectionDialog } from './AddToCollectionDialog';

export interface LeisureItemDetailPageProps {
  itemId: string;
}

function progressFieldLabel(item: LeisureItem): string | null {
  if (item.type === 'book') return 'Página atual';
  if (item.type === 'audiobook') return 'Minuto atual';
  if (item.type === 'tvShow') return 'Episódio atual';
  if (item.type === 'podcast') return 'Episódio atual';
  return null;
}

/** `/app/tempo-livre/item/[id]` — the first dynamic route in Tempo Livre. Only ever shows the fields relevant to the item's own `type`. */
export function LeisureItemDetailPage({ itemId }: LeisureItemDetailPageProps) {
  const router = useRouter();
  const { showSuccess } = useSnackbar();
  const confirmAction = useConfirmAction();

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'not-found'>('loading');
  const [item, setItem] = useState<LeisureItem | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [collections, setCollections] = useState<LeisureCollection[]>([]);
  const [planOpen, setPlanOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** A local typing buffer, separate from `item`'s own server-confirmed value — committed only on blur, so each keystroke doesn't race an async round trip through `updateProgress`+reload. Re-synced whenever `item` reloads (initial load, or after a commit). */
  const [progressInput, setProgressInput] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!item) return;
    const currentProgress = getLeisureItemProgress(item);
    queueMicrotask(() => {
      if (currentProgress) setProgressInput(String(currentProgress.current));
    });
  }, [item]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([
      leisureItemService.getLeisureItem(itemId),
      noteService.getNotes(),
      collectionService.getCollections(),
    ])
      .then(([loadedItem, allNotes, allCollections]) => {
        if (cancelled) return;
        if (!loadedItem) {
          setStatus('not-found');
          return;
        }
        setItem(loadedItem);
        setNotes(allNotes.filter((note) => note.relatedEntity?.entityId === itemId));
        setCollections(allCollections);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [itemId, reloadToken]);

  async function handleToggleFavorite() {
    if (!item) return;
    await leisureItemService.toggleFavorite(item.id);
    reload();
  }

  async function handleEdit(values: LeisureItemFormValues) {
    if (!item) return;
    setIsSubmitting(true);
    try {
      await leisureItemService.updateLeisureItem(
        item.id,
        mapFormValuesToLeisureItemPatch(values, item),
      );
      showSuccess('Item atualizado.');
      setEditOpen(false);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleCollection(collectionId: string, checked: boolean) {
    if (!item) return;
    if (checked) {
      await collectionService.addItemToCollection(collectionId, item.id);
    } else {
      await collectionService.removeItemFromCollection(collectionId, item.id);
    }
    const updated = await collectionService.getCollections();
    setCollections(updated);
  }

  async function handleStart() {
    if (!item) return;
    await leisureItemService.updateLeisureItem(item.id, { status: 'inProgress' } as Parameters<
      typeof leisureItemService.updateLeisureItem
    >[1]);
    showSuccess('Atividade iniciada.');
    reload();
  }

  async function handleArchive() {
    if (!item) return;
    confirmAction.request({
      title: 'Arquivar item?',
      description: `"${item.title}" será arquivado.`,
      confirmLabel: 'Arquivar',
      onConfirm: async () => {
        await leisureItemService.archiveLeisureItem(item.id);
        showSuccess('Item arquivado.');
        reload();
      },
    });
  }

  function handleDelete() {
    if (!item) return;
    confirmAction.request({
      title: 'Excluir item?',
      description: `"${item.title}" será removido permanentemente.`,
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        await leisureItemService.deleteLeisureItem(item.id);
        showSuccess('Item excluído.');
        router.push(leisureRoutes.library);
      },
    });
  }

  async function handlePlan(values: PlanEntryFormValues) {
    if (!item) return;
    await leisurePlanService.createPlanEntry({ ...values, leisureItemId: item.id });
    showSuccess('Atividade planejada.');
    setPlanOpen(false);
  }

  async function handleCreateNote(draft: NoteDraft) {
    if (!item) return;
    setIsSubmitting(true);
    try {
      await noteService.createNote({
        title: draft.title || undefined,
        content: draft.content,
        type: draft.type,
        linkUrl: draft.type === 'link' ? draft.linkUrl : undefined,
        tags: draft.tags,
        checklistItems: draft.type === 'checklist' ? draft.checklistItems : undefined,
        relatedEntity: { entityType: 'leisureItem', entityId: item.id },
      });
      showSuccess('Nota salva.');
      setNoteOpen(false);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleComplete(draft: LogEntryDraft) {
    if (!item) return;
    setIsSubmitting(true);
    try {
      await historyService.createLogEntry({
        leisureItemId: item.id,
        activityType: item.type,
        title: item.title,
        completedAt: draft.completedAt.toISOString(),
        duration: draft.duration,
        rating: draft.rating ?? undefined,
        notes: draft.notes || undefined,
      });
      await leisureItemService.updateLeisureItem(item.id, { status: 'completed' } as Parameters<
        typeof leisureItemService.updateLeisureItem
      >[1]);
      showSuccess('Item concluído.');
      setLogOpen(false);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function commitProgress(value: number) {
    if (!item) return;
    const field =
      item.type === 'book'
        ? 'currentPage'
        : item.type === 'audiobook'
          ? 'currentMinute'
          : 'currentEpisode';
    await leisureItemService.updateProgress(item.id, { [field]: value });
    reload();
  }

  if (status === 'loading') {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="text" width={280} height={40} />
      </Stack>
    );
  }

  if (status === 'not-found') {
    return <Alert severity="error">Item não encontrado.</Alert>;
  }

  if (status === 'error' || !item) {
    return (
      <Alert severity="error">Não foi possível carregar este item agora. Tente novamente.</Alert>
    );
  }

  const duration = getEffectiveDuration(item);
  const progress = getLeisureItemProgress(item);
  const progressLabel = progressFieldLabel(item);

  return (
    <Stack spacing={4}>
      <Box
        sx={(theme) => ({
          aspectRatio: '16 / 7',
          borderRadius: 2,
          backgroundColor: themePalette(theme).kokyu.background.subtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: item.coverImage ? `url(${item.coverImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        })}
      >
        {!item.coverImage ? (
          <TheaterComedyRoundedIcon
            aria-hidden="true"
            sx={(theme) => ({ fontSize: 56, color: themePalette(theme).kokyu.text.disabled })}
          />
        ) : null}
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
      >
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="displaySmall" component="h1">
              {item.title}
            </Typography>
            <IconButton
              aria-label={item.favorite ? 'Remover dos favoritos' : 'Favoritar'}
              onClick={handleToggleFavorite}
            >
              {item.favorite ? (
                <StarRoundedIcon
                  sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.warning })}
                />
              ) : (
                <StarOutlineRoundedIcon />
              )}
            </IconButton>
          </Stack>
          {item.description ? (
            <Typography
              variant="body1"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {item.description}
            </Typography>
          ) : null}
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {getLeisureItemTypeLabel(item.type)} · {getStatusLabel(item.type, item.status)}
            {duration ? ` · ${formatDuration(duration)}` : ''}
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
          {item.status !== 'inProgress' && item.status !== 'completed' ? (
            <KokyuButton variant="contained" onClick={handleStart}>
              Começar
            </KokyuButton>
          ) : null}
          {item.status !== 'completed' ? (
            <KokyuButton variant="outlined" onClick={() => setLogOpen(true)}>
              Marcar como concluído
            </KokyuButton>
          ) : (
            <KokyuButton variant="outlined" onClick={() => setLogOpen(true)}>
              Registrar novamente
            </KokyuButton>
          )}
          <KokyuButton variant="outlined" onClick={() => setPlanOpen(true)}>
            Planejar
          </KokyuButton>
          <KokyuButton
            variant="outlined"
            startIcon={<NoteAddOutlinedIcon />}
            onClick={() => setNoteOpen(true)}
          >
            Adicionar nota
          </KokyuButton>
          <KokyuButton
            variant="outlined"
            startIcon={<PlaylistAddRoundedIcon />}
            onClick={() => setCollectionsOpen(true)}
          >
            Adicionar a uma lista
          </KokyuButton>
          <KokyuButton
            variant="text"
            startIcon={<EditRoundedIcon />}
            onClick={() => setEditOpen(true)}
          >
            Editar
          </KokyuButton>
          <KokyuButton variant="text" startIcon={<ArchiveOutlinedIcon />} onClick={handleArchive}>
            Arquivar
          </KokyuButton>
          <KokyuButton
            variant="text"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={handleDelete}
          >
            Excluir
          </KokyuButton>
        </Stack>
      </Stack>

      {progress && progressLabel ? (
        <Stack spacing={1}>
          <Typography variant="labelLarge">Progresso</Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <KokyuTextField
              label={progressLabel}
              type="number"
              slotProps={{ htmlInput: { min: 0, max: progress.total } }}
              value={progressInput}
              onChange={(event) => setProgressInput(event.target.value)}
              onBlur={() => commitProgress(Number(progressInput) || 0)}
              sx={{ maxWidth: 200 }}
            />
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {progress.current} / {progress.total} ({progress.percent}%)
            </Typography>
          </Stack>
        </Stack>
      ) : null}

      {notes.length > 0 ? (
        <Stack spacing={1.5}>
          <Typography variant="labelLarge">Notas</Typography>
          <Stack spacing={1}>
            {notes.map((note) => (
              <Typography key={note.id} variant="body2">
                {note.content || note.title}
              </Typography>
            ))}
          </Stack>
        </Stack>
      ) : null}

      <PlanEntryDialog
        open={planOpen}
        defaultValues={{ title: item.title, date: toDateKey(new Date()) }}
        onClose={() => setPlanOpen(false)}
        onSave={handlePlan}
      />
      <NoteDialog
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSave={handleCreateNote}
        isSubmitting={isSubmitting}
      />
      <LeisureItemDialog
        open={editOpen}
        defaultValues={mapLeisureItemToFormValues(item)}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
        isSubmitting={isSubmitting}
      />
      <LogEntryDialog
        open={logOpen}
        itemTitle={item.title}
        onClose={() => setLogOpen(false)}
        onSave={handleComplete}
        isSubmitting={isSubmitting}
      />
      <AddToCollectionDialog
        open={collectionsOpen}
        itemId={item.id}
        collections={collections}
        onClose={() => setCollectionsOpen(false)}
        onToggle={handleToggleCollection}
      />
      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
