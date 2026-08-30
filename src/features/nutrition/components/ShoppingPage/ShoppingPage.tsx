'use client';

import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getIngredientCategoryLabel } from '../../constants/ingredientCategories';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useShoppingList } from '../../hooks/useShoppingList';
import { shoppingService } from '../../services/shoppingService';
import type { IngredientCategoryId } from '../../types/ingredient.types';
import type { ShoppingItem } from '../../types/shopping.types';
import {
  AddShoppingItemDialog,
  type ShoppingItemDraft,
} from '../AddShoppingItemDialog/AddShoppingItemDialog';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { SelectStorageLocationDialog } from '../SelectStorageLocationDialog/SelectStorageLocationDialog';
import { ShoppingItemRow } from '../ShoppingItemRow/ShoppingItemRow';

/** `/app/nutricao/compras` — what's still missing, grouped the way it'll actually be picked up at the store. */
export function ShoppingPage() {
  const { status, items, ingredients, storageLocations, reload } = useShoppingList();
  const { showSuccess } = useSnackbar();
  const confirmAction = useConfirmAction();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [storageDialogFor, setStorageDialogFor] = useState<'all' | ShoppingItem | null>(null);

  const ingredientById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const pendingItems = items.filter((item) => !item.checked);
  const purchasedItems = items.filter((item) => item.checked);

  const groupedPending = useMemo(() => {
    const groups = new Map<IngredientCategoryId, ShoppingItem[]>();
    for (const item of pendingItems) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return Array.from(groups.entries()).sort((a, b) =>
      getIngredientCategoryLabel(a[0]).localeCompare(getIngredientCategoryLabel(b[0]), 'pt-BR'),
    );
  }, [pendingItems]);

  async function handleToggle(item: ShoppingItem) {
    await shoppingService.toggleShoppingItem(item.id);
    reload();
  }

  async function handleAdd(draft: ShoppingItemDraft) {
    const ingredient =
      typeof draft.ingredient === 'string' ? undefined : (draft.ingredient ?? undefined);
    const name = typeof draft.ingredient === 'string' ? draft.ingredient : undefined;

    await shoppingService.addShoppingItem({
      ingredientId: ingredient?.id,
      name,
      quantity: draft.quantity,
      unit: draft.unit,
      category: draft.category,
      source: 'manual',
    });
    showSuccess('Item adicionado à lista de compras.');
    setAddDialogOpen(false);
    reload();
  }

  function handleClearPurchased() {
    confirmAction.request({
      title: 'Limpar comprados?',
      description: 'Os itens já marcados como comprados serão removidos da lista.',
      confirmLabel: 'Limpar',
      onConfirm: () => {
        shoppingService.clearPurchased().then(() => {
          showSuccess('Itens comprados removidos.');
          reload();
        });
      },
    });
  }

  async function handleMoveToPantry(storageLocationId: string) {
    if (storageDialogFor === 'all') {
      const count = await shoppingService.moveAllPurchasedToPantry(storageLocationId);
      showSuccess(
        count > 0
          ? 'Itens guardados na despensa.'
          : 'Nenhum item com ingrediente reconhecido para guardar.',
      );
    } else if (storageDialogFor) {
      await shoppingService.moveShoppingItemToPantry(storageDialogFor.id, storageLocationId);
      showSuccess('Item adicionado à despensa.');
    }
    setStorageDialogFor(null);
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
            Compras
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Compre apenas o que falta para o seu planejamento.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          onClick={() => setAddDialogOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Adicionar item
        </KokyuButton>
      </Stack>

      {status === 'loading' ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={56} />
          ))}
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar sua lista de compras agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && items.length === 0 ? (
        <EmptyState icon={ShoppingCartRoundedIcon} title="Nada para comprar por enquanto." />
      ) : null}

      {status === 'ready' && pendingItems.length > 0 ? (
        <Stack spacing={3}>
          {groupedPending.map(([category, categoryItems]) => (
            <Stack key={category} spacing={1.5}>
              <Typography
                variant="labelMedium"
                sx={(theme) => ({
                  color: themePalette(theme).kokyu.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                })}
              >
                {getIngredientCategoryLabel(category)}
              </Typography>
              <Stack spacing={1.5}>
                {categoryItems.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    ingredient={
                      item.ingredientId ? ingredientById.get(item.ingredientId) : undefined
                    }
                    onToggle={() => handleToggle(item)}
                  />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      ) : null}

      {status === 'ready' && purchasedItems.length > 0 ? (
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography
              variant="labelMedium"
              sx={(theme) => ({
                color: themePalette(theme).kokyu.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              })}
            >
              Comprados
            </Typography>
            <Stack direction="row" spacing={1}>
              <KokyuButton variant="text" size="small" onClick={() => setStorageDialogFor('all')}>
                Guardar itens comprados
              </KokyuButton>
              <KokyuButton variant="text" size="small" onClick={handleClearPurchased}>
                Limpar comprados
              </KokyuButton>
            </Stack>
          </Stack>
          <Stack spacing={1.5}>
            {purchasedItems.map((item) => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                ingredient={item.ingredientId ? ingredientById.get(item.ingredientId) : undefined}
                onToggle={() => handleToggle(item)}
              />
            ))}
          </Stack>
        </Stack>
      ) : null}

      <AddShoppingItemDialog
        open={addDialogOpen}
        ingredients={ingredients}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAdd}
      />

      <SelectStorageLocationDialog
        open={storageDialogFor !== null}
        title="Guardar na despensa"
        description="Escolha onde guardar os itens comprados."
        storageLocations={storageLocations}
        onClose={() => setStorageDialogFor(null)}
        onConfirm={handleMoveToPantry}
      />

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
