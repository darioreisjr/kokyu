'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';

import { KokyuButton } from '@/design-system/components';

import type { LeisureItemType } from '../../types/leisureItem.types';

export type AddMenuAction =
  | { kind: 'quick-capture' }
  | { kind: 'note' }
  | { kind: 'item'; type: Exclude<LeisureItemType, 'unsorted'> };

export interface AddMenuProps {
  onSelect: (action: AddMenuAction) => void;
}

const itemShortcuts: { type: Exclude<LeisureItemType, 'unsorted'>; label: string }[] = [
  { type: 'movie', label: 'Filme/Série' },
  { type: 'book', label: 'Livro' },
  { type: 'game', label: 'Jogo' },
  { type: 'place', label: 'Lugar' },
  { type: 'event', label: 'Evento' },
  { type: 'hobby', label: 'Hobby' },
  { type: 'custom', label: 'Atividade personalizada' },
];

/**
 * The single "Adicionar" entry point for the whole feature — no
 * separate FAB pattern (none exists elsewhere in the app), just the
 * same button+menu approach used throughout. Desktop shows it in the
 * section header; mobile pages render the same component in their own
 * compact header area.
 */
export function AddMenu({ onSelect }: AddMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  function select(action: AddMenuAction) {
    setAnchor(null);
    onSelect(action);
  }

  return (
    <>
      <KokyuButton
        variant="contained"
        startIcon={<AddRoundedIcon />}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Adicionar
      </KokyuButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => select({ kind: 'quick-capture' })}>Item para depois</MenuItem>
        {itemShortcuts.map((shortcut) => (
          <MenuItem
            key={shortcut.type}
            onClick={() => select({ kind: 'item', type: shortcut.type })}
          >
            {shortcut.label}
          </MenuItem>
        ))}
        <MenuItem onClick={() => select({ kind: 'note' })}>Nota</MenuItem>
      </Menu>
    </>
  );
}
