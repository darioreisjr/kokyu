'use client';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState, KokyuButton, KokyuTextField } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { leisureItemTypeDefinitions } from '../../constants/leisureItemTypes';
import { useCollections } from '../../hooks/useCollections';
import { useLeisureItems } from '../../hooks/useLeisureItems';
import type { LeisureItemFormValues } from '../../schemas/leisureItemSchema';
import { collectionService } from '../../services/collectionService';
import { leisureItemService } from '../../services/leisureItemService';
import { mapFormValuesToLeisureItemInput } from '../../utils/leisureItemFormMapper';
import { normalizeText } from '../../utils/normalizeText';
import { LeisureItemCard } from '../LeisureItemCard/LeisureItemCard';
import { LeisureItemDialog } from '../LeisureItemDialog/LeisureItemDialog';
import { CreateCollectionDialog } from './CreateCollectionDialog';

const VIEW_MODE_STORAGE_KEY = 'kokyu:leisure:library-view-mode';

type FilterValue = 'todos' | 'favoritos' | (typeof leisureItemTypeDefinitions)[number]['id'];

const filterOptions: { id: FilterValue; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'movie', label: 'Filmes' },
  { id: 'tvShow', label: 'Séries' },
  { id: 'book', label: 'Livros' },
  { id: 'audiobook', label: 'Audiobooks' },
  { id: 'game', label: 'Jogos' },
  { id: 'podcast', label: 'Podcasts' },
  { id: 'music', label: 'Música' },
  { id: 'video', label: 'Vídeos' },
  { id: 'article', label: 'Artigos' },
  { id: 'favoritos', label: 'Favoritas' },
];

/** `/app/tempo-livre/biblioteca` — filmes, séries, livros, jogos, podcasts, música, vídeos, artigos and every other library-type item, sharing one filter/search/view-mode surface instead of a page per type. */
export function LibraryPage() {
  const { status, items, reload } = useLeisureItems();
  const { status: collectionsStatus, collections, reload: reloadCollections } = useCollections();
  const { showSuccess } = useSnackbar();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (stored === 'grid' || stored === 'list') setViewMode(stored);
      } catch {
        // ignore — falls back to the default grid view
      }
    });
  }, []);

  function handleViewModeChange(next: 'grid' | 'list' | null) {
    if (!next) return;
    setViewMode(next);
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
    } catch {
      // per-viewer convenience only — safe to lose
    }
  }

  const libraryItems = items.filter(
    (item) =>
      leisureItemTypeDefinitions.find((definition) => definition.id === item.type)?.section ===
      'library',
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(search);
    return libraryItems
      .filter((item) => {
        if (normalizedQuery) {
          const matchesTitle = normalizeText(item.title).includes(normalizedQuery);
          const matchesTag = item.tags.some((tag) => normalizeText(tag).includes(normalizedQuery));
          if (!matchesTitle && !matchesTag) return false;
        }
        if (filter === 'favoritos') return item.favorite;
        if (filter !== 'todos') return item.type === filter;
        return true;
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  }, [libraryItems, search, filter]);

  async function handleAddItem(values: LeisureItemFormValues) {
    setIsSubmitting(true);
    try {
      await leisureItemService.createLeisureItem(mapFormValuesToLeisureItemInput(values));
      showSuccess('Item salvo.');
      setAddDialogOpen(false);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateCollection(name: string) {
    await collectionService.createCollection({ name });
    showSuccess('Lista criada.');
    setCreateCollectionOpen(false);
    reloadCollections();
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
            Biblioteca
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Filmes, séries, livros, jogos e tudo o mais que você quer aproveitar.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          onClick={() => setAddDialogOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Adicionar
        </KokyuButton>
      </Stack>

      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <KokyuTextField
            label="Buscar na biblioteca"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1 }}
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_event, next: 'grid' | 'list' | null) => handleViewModeChange(next)}
            aria-label="Modo de visualização"
            size="small"
          >
            <ToggleButton value="grid" aria-label="Grade">
              <GridViewRoundedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="Lista">
              <ViewListRoundedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_event, next: FilterValue | null) => next && setFilter(next)}
          aria-label="Filtrar biblioteca"
          size="small"
          sx={{
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: '1px solid',
              borderRadius: '8px !important',
            },
          }}
        >
          {filterOptions.map((option) => (
            <ToggleButton key={option.id} value={option.id} sx={{ textTransform: 'none' }}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {collectionsStatus === 'ready' ? (
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="labelLarge">Minhas listas</Typography>
            <KokyuButton variant="text" size="small" onClick={() => setCreateCollectionOpen(true)}>
              Criar lista
            </KokyuButton>
          </Stack>
          {collections.length > 0 ? (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              {collections.map((collection) => (
                <Box
                  key={collection.id}
                  sx={(theme) => ({
                    borderRadius: 999,
                    border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                    paddingInline: 1.5,
                    paddingBlock: 0.5,
                  })}
                >
                  <Typography variant="labelSmall">
                    {collection.name} ({collection.itemIds.length})
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Nenhuma lista criada ainda.
            </Typography>
          )}
        </Stack>
      ) : null}

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={200} />
          ))}
        </Box>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar sua biblioteca agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && libraryItems.length === 0 ? (
        <EmptyState
          icon={MenuBookRoundedIcon}
          title="Comece adicionando algo que você quer assistir, ler, jogar ou ouvir."
          action={
            <KokyuButton variant="contained" onClick={() => setAddDialogOpen(true)}>
              Adicionar
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' && libraryItems.length > 0 ? (
        filteredItems.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                viewMode === 'grid'
                  ? { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }
                  : '1fr',
              gap: 2,
            }}
          >
            {filteredItems.map((item) => (
              <LeisureItemCard
                key={item.id}
                item={item}
                layout={viewMode === 'grid' ? 'grid' : 'list'}
              />
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Nenhum item encontrado.
          </Typography>
        )
      ) : null}

      <LeisureItemDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddItem}
        isSubmitting={isSubmitting}
      />
      <CreateCollectionDialog
        open={createCollectionOpen}
        onClose={() => setCreateCollectionOpen(false)}
        onSave={handleCreateCollection}
      />
    </Stack>
  );
}
