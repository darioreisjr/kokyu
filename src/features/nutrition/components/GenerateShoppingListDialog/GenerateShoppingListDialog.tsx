'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { addDays } from 'date-fns';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuDateField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getIngredientCategoryLabel } from '../../constants/ingredientCategories';
import { getUnitAbbreviation } from '../../constants/units';
import { getShoppingNeedsForRange } from '../../services/shoppingNeedsService';
import type { Ingredient } from '../../types/ingredient.types';
import type { ShoppingNeedsSummary } from '../../types/shoppingNeeds.types';
import { getWeekDays, toDateKey } from '../../utils/dateHelpers';

type Interval = 'hoje' | '3-dias' | 'semana' | 'personalizado';

const intervalOptions: { id: Interval; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: '3-dias', label: 'Próximos 3 dias' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'personalizado', label: 'Personalizado' },
];

export interface GenerateShoppingListDialogProps {
  open: boolean;
  weekStart: Date;
  weekStartsOn: 0 | 1;
  ingredients: Ingredient[];
  onClose: () => void;
  onConfirm: (summary: ShoppingNeedsSummary) => void;
}

/**
 * "Gerar lista de compras" — pick an selectedInterval, see the real
 * reconciliation (necessário/já tenho/comprar) before anything is
 * added, per the spec's explicit "não adicionar automaticamente tudo
 * cegamente."
 */
export function GenerateShoppingListDialog({
  open,
  weekStart,
  weekStartsOn,
  ingredients,
  onClose,
  onConfirm,
}: GenerateShoppingListDialogProps) {
  const [selectedInterval, setSelectedInterval] = useState<Interval>('semana');
  const [customStart, setCustomStart] = useState<Date | null>(new Date());
  const [customEnd, setCustomEnd] = useState<Date | null>(addDays(new Date(), 6));
  const [summary, setSummary] = useState<ShoppingNeedsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setSelectedInterval('semana');
      setSummary(null);
    });
  }, [open]);

  const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));

  function getRange(): { start: Date; end: Date } {
    const today = new Date();
    if (selectedInterval === 'hoje') return { start: today, end: today };
    if (selectedInterval === '3-dias') return { start: today, end: addDays(today, 2) };
    if (selectedInterval === 'semana') {
      const days = getWeekDays(weekStart, weekStartsOn);
      return { start: days[0]!, end: days[6]! };
    }
    return { start: customStart ?? today, end: customEnd ?? today };
  }

  async function handlePreview() {
    setIsLoading(true);
    const { start, end } = getRange();
    const result = await getShoppingNeedsForRange(toDateKey(start), toDateKey(end));
    setSummary(result);
    setIsLoading(false);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="generate-shopping-title"
    >
      <DialogTitle id="generate-shopping-title">Gerar lista de compras</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ marginTop: 1 }}>
          <ToggleButtonGroup
            value={selectedInterval}
            exclusive
            onChange={(_event, next: Interval | null) => {
              if (!next) return;
              setSelectedInterval(next);
              setSummary(null);
            }}
            size="small"
            aria-label="Intervalo"
            sx={{
              flexWrap: 'wrap',
              gap: 1,
              '& .MuiToggleButtonGroup-grouped': {
                border: '1px solid',
                borderRadius: '8px !important',
              },
            }}
          >
            {intervalOptions.map((option) => (
              <ToggleButton key={option.id} value={option.id} sx={{ textTransform: 'none' }}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {selectedInterval === 'personalizado' ? (
            <Stack direction="row" spacing={2}>
              <KokyuDateField label="De" value={customStart} onChange={setCustomStart} />
              <KokyuDateField label="Até" value={customEnd} onChange={setCustomEnd} />
            </Stack>
          ) : null}

          {!summary ? (
            <KokyuButton variant="outlined" onClick={handlePreview} loading={isLoading}>
              Calcular
            </KokyuButton>
          ) : (
            <Stack spacing={1.5}>
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {summary.totalIngredients} ingredientes necessários · {summary.alreadyInPantry} já
                estão na despensa · {summary.needsPurchase} precisam ser comprados
              </Typography>
              {summary.needsPurchase > 0 ? (
                <Stack
                  component="ul"
                  spacing={0.5}
                  sx={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    maxHeight: 220,
                    overflowY: 'auto',
                  }}
                >
                  {summary.items
                    .filter((item) => item.shortfallQuantity > 0)
                    .map((item) => {
                      const ingredient = ingredientById.get(item.ingredientId);
                      return (
                        <Typography component="li" key={item.ingredientId} variant="body2">
                          {ingredient
                            ? getIngredientCategoryLabel(ingredient.category) + ' · '
                            : ''}
                          {ingredient?.name ?? item.ingredientId} — {item.shortfallQuantity}{' '}
                          {getUnitAbbreviation(item.unit)}
                        </Typography>
                      );
                    })}
                </Stack>
              ) : (
                <Typography variant="body2">
                  Você já tem tudo que precisa para este período.
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          variant="contained"
          disabled={!summary || summary.needsPurchase === 0}
          onClick={() => summary && onConfirm(summary)}
        >
          Adicionar às compras
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
