'use client';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import InventoryRoundedIcon from '@mui/icons-material/Inventory2Rounded';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { EmptyState, KokyuButton, KokyuTextField } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getStorageLocationName } from '../../constants/storageLocations';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { usePantry } from '../../hooks/usePantry';
import { ingredientService } from '../../services/ingredientService';
import { pantryService } from '../../services/pantryService';
import { shoppingService } from '../../services/shoppingService';
import type { PantryItem } from '../../types/pantry.types';
import { toDateKey } from '../../utils/dateHelpers';
import { normalizeText } from '../../utils/normalizeText';
import { getPantryFreshnessStatus, isPantryItemLowStock } from '../../utils/pantryFreshness';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { PantryItemDialog, type PantryItemDraft } from '../PantryItemDialog/PantryItemDialog';
import { PantryItemRow } from '../PantryItemRow/PantryItemRow';
import { PantryFilters, type PantryFilter } from './PantryFilters';

type SortOption = 'validade' | 'nome' | 'categoria' | 'quantidade' | 'recentes';

const sortOptions: { id: SortOption; label: string }[] = [
  { id: 'validade', label: 'Validade' },
  { id: 'nome', label: 'Nome' },
  { id: 'categoria', label: 'Categoria' },
  { id: 'quantidade', label: 'Quantidade' },
  { id: 'recentes', label: 'Adicionado recentemente' },
];

/** `/app/nutricao/despensa` — everything already at home, across every storage location. */
export function PantryPage() {
  const { status, items, ingredients, storageLocations, reload } = usePantry();
  const { showSuccess } = useSnackbar();
  const confirmAction = useConfirmAction();

  const [filter, setFilter] = useState<PantryFilter>('todos');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('validade');
  const [dialogItem, setDialogItem] = useState<PantryItem | 'new' | null>(null);

  const ingredientById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const visibleItems = useMemo(() => {
    const normalizedQuery = normalizeText(search);
    let filtered = items.filter((item) => {
      const ingredient = ingredientById.get(item.ingredientId);
      if (normalizedQuery) {
        const matchesName = ingredient
          ? normalizeText(ingredient.name).includes(normalizedQuery)
          : false;
        const matchesCategory = ingredient
          ? normalizeText(ingredient.category).includes(normalizedQuery)
          : false;
        if (!matchesName && !matchesCategory) return false;
      }
      if (filter === 'despensa' || filter === 'geladeira' || filter === 'freezer') {
        return item.storageLocationId === filter;
      }
      if (filter === 'vencendo') return getPantryFreshnessStatus(item) === 'expiring';
      if (filter === 'estoque-baixo') return isPantryItemLowStock(item);
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      if (sort === 'validade')
        return (a.expirationDate ?? '9999-99-99').localeCompare(b.expirationDate ?? '9999-99-99');
      if (sort === 'nome') {
        const nameA = ingredientById.get(a.ingredientId)?.name ?? '';
        const nameB = ingredientById.get(b.ingredientId)?.name ?? '';
        return nameA.localeCompare(nameB, 'pt-BR');
      }
      if (sort === 'categoria') {
        const categoryA = ingredientById.get(a.ingredientId)?.category ?? '';
        const categoryB = ingredientById.get(b.ingredientId)?.category ?? '';
        return categoryA.localeCompare(categoryB);
      }
      if (sort === 'quantidade') return b.quantity - a.quantity;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return filtered;
  }, [items, ingredientById, search, filter, sort]);

  async function handleSave(draft: PantryItemDraft) {
    if (!draft.ingredient) return;
    const ingredient =
      typeof draft.ingredient === 'string'
        ? await ingredientService.findOrCreateByName(draft.ingredient, 'outros', draft.unit)
        : draft.ingredient;

    const input = {
      ingredientId: ingredient.id,
      quantity: draft.quantity,
      unit: draft.unit,
      storageLocationId: draft.storageLocationId,
      purchaseDate: draft.purchaseDate ? toDateKey(draft.purchaseDate) : undefined,
      expirationDate: draft.expirationDate ? toDateKey(draft.expirationDate) : undefined,
      minimumStock: draft.minimumStock,
      notes: draft.notes || undefined,
    };

    if (dialogItem && dialogItem !== 'new') {
      await pantryService.updatePantryItem(dialogItem.id, input);
      showSuccess('Item atualizado.');
    } else {
      await pantryService.addPantryItem(input);
      showSuccess('Item adicionado à despensa.');
    }
    setDialogItem(null);
    reload();
  }

  function handleRemove(item: PantryItem) {
    confirmAction.request({
      title: 'Remover item?',
      description: 'Este item será removido da sua despensa.',
      confirmLabel: 'Remover',
      onConfirm: () => {
        pantryService.removePantryItem(item.id).then(() => {
          showSuccess('Item removido.');
          reload();
        });
      },
    });
  }

  async function handleMarkOut(item: PantryItem) {
    const ingredient = ingredientById.get(item.ingredientId);
    await shoppingService.addShoppingItem({
      ingredientId: item.ingredientId,
      name: ingredient?.name,
      quantity: (item.minimumStock ?? item.quantity) || 1,
      unit: item.unit,
      category: ingredient?.category ?? 'outros',
      source: 'out-of-stock',
    });
    await pantryService.removePantryItem(item.id);
    showSuccess('Item adicionado à lista de compras.');
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
            Despensa
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Veja o que você já tem antes de comprar.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          onClick={() => setDialogItem('new')}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Adicionar item
        </KokyuButton>
      </Stack>

      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <KokyuTextField
            label="Buscar na despensa"
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
            sx={{ flex: 2 }}
          />
          <KokyuTextField
            select
            label="Ordenar por"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            sx={{ flex: 1, minWidth: 180 }}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </KokyuTextField>
        </Stack>
        <PantryFilters value={filter} onChange={setFilter} />
      </Stack>

      {status === 'loading' ? (
        <Stack spacing={2}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={88} />
          ))}
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar sua despensa agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && items.length === 0 ? (
        <EmptyState
          icon={InventoryRoundedIcon}
          title="Despensa vazia"
          description="Adicione o que você já tem em casa."
          action={
            <KokyuButton variant="contained" onClick={() => setDialogItem('new')}>
              Adicionar item
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' && items.length > 0 ? (
        <Stack spacing={2}>
          {visibleItems.map((item) => (
            <PantryItemRow
              key={item.id}
              item={item}
              ingredient={ingredientById.get(item.ingredientId)}
              storageLocationName={getStorageLocationName(item.storageLocationId)}
              onEdit={() => setDialogItem(item)}
              onRemove={() => handleRemove(item)}
              onMarkOut={() => handleMarkOut(item)}
            />
          ))}
        </Stack>
      ) : null}

      <PantryItemDialog
        open={dialogItem !== null}
        item={dialogItem && dialogItem !== 'new' ? dialogItem : null}
        ingredients={ingredients}
        storageLocations={storageLocations}
        onClose={() => setDialogItem(null)}
        onSave={handleSave}
      />

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
