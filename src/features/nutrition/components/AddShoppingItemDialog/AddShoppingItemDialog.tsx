'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import { ingredientCategoryDefinitions } from '../../constants/ingredientCategories';
import { unitDefinitions } from '../../constants/units';
import type { Ingredient, IngredientCategoryId } from '../../types/ingredient.types';
import type { Unit } from '../../types/units.types';

export interface ShoppingItemDraft {
  ingredient: Ingredient | string | null;
  quantity: number;
  unit: Unit;
  category: IngredientCategoryId;
}

export interface AddShoppingItemDialogProps {
  open: boolean;
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (draft: ShoppingItemDraft) => void;
}

const emptyDraft: ShoppingItemDraft = {
  ingredient: null,
  quantity: 1,
  unit: 'unidade',
  category: 'outros',
};

/** "Adicionar manualmente" — a real ingredient or a free-text household item (guardanapo, papel alumínio), both land as one `ShoppingItem`. */
export function AddShoppingItemDialog({
  open,
  ingredients,
  onClose,
  onSave,
}: AddShoppingItemDialogProps) {
  const [draft, setDraft] = useState<ShoppingItemDraft>(emptyDraft);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setDraft(emptyDraft));
  }, [open]);

  function handleIngredientChange(value: Ingredient | string | null) {
    setDraft((current) => ({
      ...current,
      ingredient: value,
      category: typeof value === 'object' && value ? value.category : current.category,
    }));
  }

  const canSubmit =
    Boolean(typeof draft.ingredient === 'string' ? draft.ingredient.trim() : draft.ingredient) &&
    draft.quantity > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="add-shopping-item-title"
    >
      <DialogTitle id="add-shopping-item-title">Adicionar item</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ marginTop: 1 }}>
          <Autocomplete
            freeSolo
            options={ingredients}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            value={draft.ingredient}
            onChange={(_event, value) => handleIngredientChange(value)}
            onInputChange={(_event, value, reason) => {
              if (reason === 'input') handleIngredientChange(value || null);
            }}
            renderInput={(params) => <KokyuTextField {...params} label="Item" autoFocus />}
          />
          <Stack direction="row" spacing={2}>
            <KokyuTextField
              label="Quantidade"
              type="number"
              value={draft.quantity}
              onChange={(event) =>
                setDraft((current) => ({ ...current, quantity: Number(event.target.value) || 0 }))
              }
              slotProps={{ htmlInput: { min: 0, step: 'any' } }}
              sx={{ flex: 1 }}
            />
            <KokyuTextField
              select
              label="Unidade"
              value={draft.unit}
              onChange={(event) =>
                setDraft((current) => ({ ...current, unit: event.target.value as Unit }))
              }
              sx={{ flex: 1 }}
            >
              {unitDefinitions.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.label}
                </MenuItem>
              ))}
            </KokyuTextField>
          </Stack>
          <KokyuTextField
            select
            label="Categoria"
            value={draft.category}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                category: event.target.value as IngredientCategoryId,
              }))
            }
          >
            {ingredientCategoryDefinitions.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.label}
              </MenuItem>
            ))}
          </KokyuTextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton variant="contained" disabled={!canSubmit} onClick={() => onSave(draft)}>
          Adicionar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
