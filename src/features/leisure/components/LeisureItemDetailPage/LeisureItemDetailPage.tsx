'use client';

import EditRoundedIcon from '@mui/icons-material/EditRounded';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TheaterComedyRoundedIcon from '@mui/icons-material/TheaterComedyRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { friendlyErrorMessage } from '@/lib/api/errors';
import { isHttpUrl } from '@/shared/links/httpLink';

import { getLeisureItemTypeLabel } from '../../constants/leisureItemTypes';
import { leisureRoutes } from '../../constants/leisureRoutes';
import { getStatusLabel } from '../../constants/leisureStatuses';
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
import { getItemDetailRows } from '../../utils/itemDetails';
import { getEffectiveDuration } from '../../utils/suggestionEngine';
import { getLeisureItemProgress } from '../../utils/progress';
import { LogEntryDialog, type LogEntryDraft } from '../LogEntryDialog/LogEntryDialog';
import { NoteDialog, type NoteDraft } from '../NoteDialog/NoteDialog';
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
  const { showSuccess, showError } = useSnackbar();

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'not-found'>('loading');
  const [item, setItem] = useState<LeisureItem | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [collections, setCollections] = useState<LeisureCollection[]>([]);
  const [planOpen, setPlanOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
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
    try {
      await leisureItemService.toggleFavorite(item.id);
      reload();
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível atualizar o favorito agora.'));
    }
  }

  async function handleToggleCollection(collectionId: string, checked: boolean) {
    if (!item) return;
    try {
      if (checked) {
        await collectionService.addItemToCollection(collectionId, item.id);
      } else {
        await collectionService.removeItemFromCollection(collectionId, item.id);
      }
      const updated = await collectionService.getCollections();
      setCollections(updated);
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível atualizar a coleção agora.'));
    }
  }

  async function handleStart() {
    if (!item) return;
    try {
      await leisureItemService.updateLeisureItem(item.id, { status: 'inProgress' } as Parameters<
        typeof leisureItemService.updateLeisureItem
      >[1]);
      showSuccess('Atividade iniciada.');
      reload();
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível iniciar agora.'));
    }
  }

  async function handlePlan(values: PlanEntryFormValues) {
    if (!item) return;
    try {
      await leisurePlanService.createPlanEntry({ ...values, leisureItemId: item.id });
      showSuccess('Atividade planejada.');
      setPlanOpen(false);
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível planejar agora.'));
    }
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
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível salvar a nota agora.'));
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
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível concluir agora.'));
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
  const detailRows = getItemDetailRows(item);
  // Only a valid http(s) link reaches the CSS url() - never arbitrary stored text.
  const coverUrl = item.coverImage && isHttpUrl(item.coverImage) ? item.coverImage : undefined;

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: 'flex-start' }}>
      {/* Left: the cover, then every action for this item. */}
      <Stack
        spacing={2}
        sx={{
          width: { xs: '100%', md: 300 },
          flexShrink: 0,
        }}
      >
        <Box
          role="img"
          aria-label={coverUrl ? `Capa de ${item.title}` : `${item.title} (sem capa)`}
          sx={(theme) => ({
            width: '100%',
            // Smaller on phones, so the actions show up without scrolling.
            maxWidth: { xs: 240, md: 'none' },
            alignSelf: 'center',
            aspectRatio: '3 / 4',
            borderRadius: 2,
            backgroundColor: themePalette(theme).kokyu.background.subtle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: coverUrl ? `url("${encodeURI(coverUrl)}")` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          })}
        >
          {!coverUrl ? (
            <TheaterComedyRoundedIcon
              aria-hidden="true"
              sx={(theme) => ({ fontSize: 56, color: themePalette(theme).kokyu.text.disabled })}
            />
          ) : null}
        </Box>

        <Stack spacing={1}>
          {item.status !== 'inProgress' && item.status !== 'completed' ? (
            <KokyuButton variant="contained" fullWidth onClick={handleStart}>
              Começar
            </KokyuButton>
          ) : null}
          {item.status !== 'completed' ? (
            <KokyuButton variant="outlined" fullWidth onClick={() => setLogOpen(true)}>
              Marcar como concluído
            </KokyuButton>
          ) : (
            <KokyuButton variant="outlined" fullWidth onClick={() => setLogOpen(true)}>
              Registrar novamente
            </KokyuButton>
          )}
          <KokyuButton variant="outlined" fullWidth onClick={() => setPlanOpen(true)}>
            Planejar
          </KokyuButton>
          <KokyuButton
            variant="outlined"
            fullWidth
            startIcon={<NoteAddOutlinedIcon />}
            onClick={() => setNoteOpen(true)}
          >
            Adicionar nota
          </KokyuButton>
          <KokyuButton
            variant="outlined"
            fullWidth
            startIcon={<PlaylistAddRoundedIcon />}
            onClick={() => setCollectionsOpen(true)}
          >
            Adicionar a uma lista
          </KokyuButton>
        </Stack>
      </Stack>

      {/* Right: what this item is. */}
      <Stack spacing={4} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        <Stack spacing={0.5}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              columnGap: 2,
              rowGap: 1,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
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
            <KokyuButton
              variant="outlined"
              size="small"
              startIcon={<EditRoundedIcon />}
              component={NextLink}
              href={leisureRoutes.itemEdit(item.id)}
              sx={{ flexShrink: 0, marginTop: 0.5 }}
            >
              Editar
            </KokyuButton>
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

        {detailRows.length > 0 || item.tags.length > 0 ? (
          <Stack spacing={1.5}>
            <Typography variant="labelLarge" component="h2">
              Detalhes
            </Typography>
            {detailRows.length > 0 ? (
              <Box
                component="dl"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  columnGap: 3,
                  rowGap: 1.5,
                  margin: 0,
                }}
              >
                {detailRows.map((row) => (
                  <Stack key={row.label} spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography
                      component="dt"
                      variant="labelSmall"
                      sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                    >
                      {row.label}
                    </Typography>
                    <Typography
                      component="dd"
                      variant="body1"
                      sx={{ margin: 0, overflowWrap: 'anywhere' }}
                    >
                      {row.href ? (
                        <Link href={row.href} target="_blank" rel="noreferrer">
                          {row.value}
                        </Link>
                      ) : (
                        row.value
                      )}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            ) : null}
            {item.tags.length > 0 ? (
              <Stack
                direction="row"
                spacing={0.5}
                aria-label="Tags"
                sx={{ flexWrap: 'wrap', rowGap: 0.5 }}
              >
                {item.tags.map((tag) => (
                  <Chip key={tag} size="small" label={tag} />
                ))}
              </Stack>
            ) : null}
          </Stack>
        ) : null}

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
      </Stack>
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
    </Stack>
  );
}
