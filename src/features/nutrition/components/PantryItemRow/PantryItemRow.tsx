'use client';

import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { getUnitAbbreviation } from '../../constants/units';
import type { Ingredient } from '../../types/ingredient.types';
import type { PantryFreshnessStatus, PantryItem } from '../../types/pantry.types';
import { getPantryFreshnessStatus, isPantryItemLowStock } from '../../utils/pantryFreshness';

const FRESHNESS_LABEL: Record<PantryFreshnessStatus, string> = {
  fresh: 'Válido',
  expiring: 'Vence em breve',
  expired: 'Vencido',
  unknown: '',
};

export interface PantryItemRowProps {
  item: PantryItem;
  ingredient?: Ingredient;
  storageLocationName: string;
  onEdit: () => void;
  onRemove: () => void;
  onMarkOut: () => void;
}

/** One pantry row — quantity/location plus, never color-only, an icon-free text badge for freshness and low-stock so both read correctly without color vision. */
export function PantryItemRow({
  item,
  ingredient,
  storageLocationName,
  onEdit,
  onRemove,
  onMarkOut,
}: PantryItemRowProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const freshness = getPantryFreshnessStatus(item);
  const lowStock = isPantryItemLowStock(item);

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        padding: 2.5,
      })}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="labelLarge" component="p">
            {ingredient?.name ?? item.ingredientId}
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {item.quantity} {getUnitAbbreviation(item.unit)} · {storageLocationName}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {freshness !== 'unknown' ? (
              <Chip
                size="small"
                label={FRESHNESS_LABEL[freshness]}
                sx={(theme) => ({
                  backgroundColor:
                    freshness === 'expired'
                      ? themePalette(theme).kokyu.feedback.error
                      : freshness === 'expiring'
                        ? themePalette(theme).kokyu.feedback.warning
                        : themePalette(theme).kokyu.feedback.success,
                  color: themePalette(theme).kokyu.text.inverse,
                })}
              />
            ) : null}
            {lowStock ? (
              <Chip
                size="small"
                label="Estoque baixo"
                sx={(theme) => ({
                  backgroundColor: themePalette(theme).kokyu.feedback.warning,
                  color: themePalette(theme).kokyu.text.inverse,
                })}
              />
            ) : null}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
          {lowStock ? (
            <IconButton aria-label="Adicionar às compras" size="small" onClick={onMarkOut}>
              <AddShoppingCartRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          <IconButton
            aria-label="Mais ações"
            size="small"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onEdit();
              }}
            >
              Editar
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onMarkOut();
              }}
            >
              Marcar como acabou
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onRemove();
              }}
            >
              Remover
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Paper>
  );
}
