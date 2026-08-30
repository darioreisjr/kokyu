'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuDateField, KokyuTextField } from '@/design-system/components';

import { unitDefinitions } from '../../constants/units';
import type { Ingredient } from '../../types/ingredient.types';
import type { PantryItem, StorageLocation } from '../../types/pantry.types';
import type { Unit } from '../../types/units.types';
import { fromDateKey } from '../../utils/dateHelpers';

export interface PantryItemDraft {
  ingredient: Ingredient | string | null;
  quantity: number;
  unit: Unit;
  storageLocationId: string;
  purchaseDate: Date | null;
  expirationDate: Date | null;
  minimumStock: number | undefined;
  notes: string;
}

export interface PantryItemDialogProps {
  open: boolean;
  item: PantryItem | null;
  ingredients: Ingredient[];
  storageLocations: StorageLocation[];
  onClose: () => void;
  onSave: (draft: PantryItemDraft) => void;
}

const emptyDraft: PantryItemDraft = {
  ingredient: null,
  quantity: 1,
  unit: 'unidade',
  storageLocationId: 'despensa',
  purchaseDate: null,
  expirationDate: null,
  minimumStock: undefined,
  notes: '',
};

/** Add/edit — one form for both, since editing is just adding with a prefilled draft. */
export function PantryItemDialog({
  open,
  item,
  ingredients,
  storageLocations,
  onClose,
  onSave,
}: PantryItemDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [draft, setDraft] = useState<PantryItemDraft>(emptyDraft);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (item) {
        setDraft({
          ingredient: ingredients.find((candidate) => candidate.id === item.ingredientId) ?? null,
          quantity: item.quantity,
          unit: item.unit,
          storageLocationId: item.storageLocationId,
          purchaseDate: item.purchaseDate ? fromDateKey(item.purchaseDate) : null,
          expirationDate: item.expirationDate ? fromDateKey(item.expirationDate) : null,
          minimumStock: item.minimumStock,
          notes: item.notes ?? '',
        });
      } else {
        setDraft(emptyDraft);
      }
    });
  }, [open, item, ingredients]);

  const canSubmit =
    Boolean(draft.ingredient) && draft.quantity >= 0 && Boolean(draft.storageLocationId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      aria-labelledby="pantry-item-title"
    >
      <DialogTitle id="pantry-item-title">{item ? 'Editar item' : 'Adicionar item'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ marginTop: 1 }}>
          <Autocomplete
            freeSolo
            options={ingredients}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            value={draft.ingredient}
            onChange={(_event, value) => setDraft((current) => ({ ...current, ingredient: value }))}
            onInputChange={(_event, value, reason) => {
              if (reason === 'input')
                setDraft((current) => ({ ...current, ingredient: value || null }));
            }}
            renderInput={(params) => <KokyuTextField {...params} label="Ingrediente" />}
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
            label="Local"
            value={draft.storageLocationId}
            onChange={(event) =>
              setDraft((current) => ({ ...current, storageLocationId: event.target.value }))
            }
          >
            {storageLocations.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.name}
              </MenuItem>
            ))}
          </KokyuTextField>
          <Stack direction="row" spacing={2}>
            <KokyuDateField
              label="Data de compra (opcional)"
              value={draft.purchaseDate}
              onChange={(value) => setDraft((current) => ({ ...current, purchaseDate: value }))}
            />
            <KokyuDateField
              label="Validade (opcional)"
              value={draft.expirationDate}
              onChange={(value) => setDraft((current) => ({ ...current, expirationDate: value }))}
            />
          </Stack>
          <KokyuTextField
            label="Estoque mínimo (opcional)"
            type="number"
            value={draft.minimumStock ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                minimumStock: event.target.value === '' ? undefined : Number(event.target.value),
              }))
            }
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          />
          <KokyuTextField
            label="Observação (opcional)"
            value={draft.notes}
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton variant="contained" disabled={!canSubmit} onClick={() => onSave(draft)}>
          Salvar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
