'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import { unitDefinitions } from '../../constants/units';
import type { Ingredient } from '../../types/ingredient.types';
import type { Unit } from '../../types/units.types';

export interface FoodFormItemValue {
  ingredientName: string;
  existingIngredient?: Ingredient;
  quantity: number;
  unit: Unit;
}

interface FoodFormRow {
  key: string;
  ingredientValue: Ingredient | string | null;
  quantity: number;
  unit: Unit;
}

export interface FoodFormStepProps {
  ingredients: Ingredient[];
  onCancel: () => void;
  onConfirm: (items: FoodFormItemValue[]) => void;
}

/** A locally-unique-enough React key — no `useRef` counter needed (and the render-phase ref access that would trip up the compiler). */
function makeRow(): FoodFormRow {
  return {
    key: `row-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ingredientValue: null,
    quantity: 1,
    unit: 'unidade',
  };
}

/** "Adicionar alimento" — one or more independent items (no recipe required), each resolved against the ingredient catalog or created fresh on save. */
export function FoodFormStep({ ingredients, onCancel, onConfirm }: FoodFormStepProps) {
  const [rows, setRows] = useState<FoodFormRow[]>(() => [makeRow()]);

  function updateRow(key: string, patch: Partial<FoodFormRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeRow(key: string) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  }

  const canSubmit = rows.every((row) => row.ingredientValue && row.quantity > 0);

  function handleSubmit() {
    const items: FoodFormItemValue[] = rows.map((row) => {
      const isExisting = typeof row.ingredientValue === 'object' && row.ingredientValue !== null;
      return {
        ingredientName: isExisting
          ? (row.ingredientValue as Ingredient).name
          : String(row.ingredientValue),
        existingIngredient: isExisting ? (row.ingredientValue as Ingredient) : undefined,
        quantity: row.quantity,
        unit: row.unit,
      };
    });
    onConfirm(items);
  }

  return (
    <Stack spacing={2.5}>
      {rows.map((row) => (
        <Stack key={row.key} direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Autocomplete
            freeSolo
            options={ingredients}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            value={row.ingredientValue}
            onChange={(_event, value) => updateRow(row.key, { ingredientValue: value })}
            onInputChange={(_event, value, reason) => {
              if (reason === 'input') updateRow(row.key, { ingredientValue: value || null });
            }}
            sx={{ flex: 2 }}
            renderInput={(params) => <KokyuTextField {...params} label="Ingrediente" />}
          />
          <KokyuTextField
            label="Quantidade"
            type="number"
            value={row.quantity}
            onChange={(event) => updateRow(row.key, { quantity: Number(event.target.value) || 0 })}
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            sx={{ flex: 1 }}
          />
          <KokyuTextField
            select
            label="Unidade"
            value={row.unit}
            onChange={(event) => updateRow(row.key, { unit: event.target.value as Unit })}
            sx={{ flex: 1, minWidth: 120 }}
          >
            {unitDefinitions.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.label}
              </MenuItem>
            ))}
          </KokyuTextField>
          <IconButton
            aria-label="Remover item"
            onClick={() => removeRow(row.key)}
            disabled={rows.length === 1}
            sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}

      <KokyuButton
        variant="text"
        size="small"
        startIcon={<AddRoundedIcon />}
        onClick={() => setRows((current) => [...current, makeRow()])}
        sx={{ alignSelf: 'flex-start' }}
      >
        Adicionar outro item
      </KokyuButton>

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <KokyuButton variant="text" onClick={onCancel}>
          Voltar
        </KokyuButton>
        <KokyuButton variant="contained" disabled={!canSubmit} onClick={handleSubmit}>
          Adicionar
        </KokyuButton>
      </Stack>
    </Stack>
  );
}
