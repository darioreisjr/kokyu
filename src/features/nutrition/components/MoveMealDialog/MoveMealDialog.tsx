'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuDateField, KokyuTextField } from '@/design-system/components';

import { mealPlanService } from '../../services/mealPlanService';
import type { MealType, PlannedMeal } from '../../types/mealPlan.types';
import { fromDateKey, toDateKey } from '../../utils/dateHelpers';

export interface MoveMealDialogProps {
  open: boolean;
  meal: PlannedMeal | null;
  mealTypes: MealType[];
  onClose: () => void;
  onMoved: () => void;
}

/**
 * "Mover para..." — the keyboard/menu-accessible alternative the spec
 * requires alongside any drag-and-drop, so moving a meal never
 * depends on a pointer gesture. Covers day, meal slot and time in one
 * step.
 */
export function MoveMealDialog({ open, meal, mealTypes, onClose, onMoved }: MoveMealDialogProps) {
  const [date, setDate] = useState<Date | null>(null);
  const [mealTypeId, setMealTypeId] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (!open || !meal) return;
    queueMicrotask(() => {
      setDate(fromDateKey(meal.date));
      setMealTypeId(meal.mealTypeId);
      setTime(meal.time ?? '');
    });
  }, [open, meal]);

  async function handleSubmit() {
    if (!meal || !date) return;
    await mealPlanService.movePlannedMeal(meal.id, {
      date: toDateKey(date),
      mealTypeId,
      time: time || undefined,
    });
    onMoved();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="move-meal-title">
      <DialogTitle id="move-meal-title">Mover refeição</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ marginTop: 1 }}>
          <KokyuDateField label="Novo dia" value={date} onChange={setDate} />
          <KokyuTextField
            select
            label="Refeição"
            value={mealTypeId}
            onChange={(event) => setMealTypeId(event.target.value)}
          >
            {mealTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </KokyuTextField>
          <KokyuTextField
            label="Horário (opcional)"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton variant="contained" onClick={handleSubmit} disabled={!date || !mealTypeId}>
          Mover
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
