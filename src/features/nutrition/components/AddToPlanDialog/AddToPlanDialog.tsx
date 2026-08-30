'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuDateField, KokyuTextField } from '@/design-system/components';

import { getEnabledMealTypes } from '../../constants/mealTypes';
import type { MealType } from '../../types/mealPlan.types';
import { toDateKey } from '../../utils/dateHelpers';

export interface AddToPlanTarget {
  recipeName: string;
  defaultServings: number;
}

export interface AddToPlanDialogProps {
  open: boolean;
  target: AddToPlanTarget | null;
  mealTypes: MealType[];
  onClose: () => void;
  onConfirm: (date: string, mealTypeId: string, servings: number) => void;
}

/**
 * "Adicionar ao planejamento" — day, refeição and porções. Shared by
 * the recipe detail page and the queue's "Atribuir a um dia": both
 * just need somewhere to put one recipe, differing only in what
 * happens after (`onConfirm` is the caller's own service call —
 * `addPlannedMeal` directly, or `assignQueueEntryToDay` when it also
 * needs to clear the queue entry).
 */
export function AddToPlanDialog({
  open,
  target,
  mealTypes,
  onClose,
  onConfirm,
}: AddToPlanDialogProps) {
  const [date, setDate] = useState<Date | null>(new Date());
  const [mealTypeId, setMealTypeId] = useState('');
  const [servings, setServings] = useState(target?.defaultServings ?? 1);

  useEffect(() => {
    if (!open || !target) return;
    queueMicrotask(() => {
      setDate(new Date());
      setMealTypeId(getEnabledMealTypes(mealTypes)[0]?.id ?? '');
      setServings(target.defaultServings);
    });
  }, [open, target, mealTypes]);

  function handleSubmit() {
    if (!date || !mealTypeId) return;
    onConfirm(toDateKey(date), mealTypeId, servings);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="add-to-plan-title"
    >
      <DialogTitle id="add-to-plan-title">Adicionar ao planejamento</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ marginTop: 1 }}>
          <KokyuDateField label="Dia" value={date} onChange={setDate} />
          <KokyuTextField
            select
            label="Refeição"
            value={mealTypeId}
            onChange={(event) => setMealTypeId(event.target.value)}
          >
            {getEnabledMealTypes(mealTypes).map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </KokyuTextField>
          <KokyuTextField
            label="Porções"
            type="number"
            value={servings}
            onChange={(event) => setServings(Number(event.target.value) || 1)}
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton variant="contained" disabled={!date || !mealTypeId} onClick={handleSubmit}>
          Adicionar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
