'use client';

import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { getUnitAbbreviation } from '../../constants/units';
import type { Ingredient } from '../../types/ingredient.types';
import type { ShoppingItem } from '../../types/shopping.types';

const SOURCE_LABEL: Record<ShoppingItem['source'], string> = {
  manual: '',
  recipe: 'Da receita',
  'meal-plan': 'Do planejamento',
  'low-stock': 'Estoque baixo',
  'out-of-stock': 'Acabou',
};

export interface ShoppingItemRowProps {
  item: ShoppingItem;
  ingredient?: Ingredient;
  onToggle: () => void;
}

/**
 * Priority order per the spec's own mobile guidance: a big checkbox
 * (one-hand tap in the market aisle), name, quantity, and — dimmed,
 * last — where the item came from. Nothing else competes for
 * attention here.
 */
export function ShoppingItemRow({ item, ingredient, onToggle }: ShoppingItemRowProps) {
  const label = ingredient?.name ?? item.name ?? 'Item';
  const sourceLabel = SOURCE_LABEL[item.source];

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Checkbox
        checked={item.checked}
        onChange={onToggle}
        size="medium"
        slotProps={{
          input: {
            'aria-label': `${item.checked ? 'Desmarcar' : 'Marcar'} ${label} como comprado`,
          },
        }}
        sx={{ padding: 1.25 }}
      />
      <Stack spacing={0.1} sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="labelLarge"
          component="p"
          sx={(theme) => ({
            textDecoration: item.checked ? 'line-through' : 'none',
            color: item.checked
              ? themePalette(theme).kokyu.text.disabled
              : themePalette(theme).kokyu.text.primary,
          })}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {item.quantity} {getUnitAbbreviation(item.unit)}
          {sourceLabel ? ` · ${sourceLabel}` : ''}
        </Typography>
      </Stack>
    </Stack>
  );
}
