'use client';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export type PantryFilter =
  'todos' | 'despensa' | 'geladeira' | 'freezer' | 'vencendo' | 'estoque-baixo';

const filterOptions: { id: PantryFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'despensa', label: 'Despensa' },
  { id: 'geladeira', label: 'Geladeira' },
  { id: 'freezer', label: 'Freezer' },
  { id: 'vencendo', label: 'Vencendo' },
  { id: 'estoque-baixo', label: 'Estoque baixo' },
];

export interface PantryFiltersProps {
  value: PantryFilter;
  onChange: (filter: PantryFilter) => void;
}

export function PantryFilters({ value, onChange }: PantryFiltersProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_event, next: PantryFilter | null) => next && onChange(next)}
      aria-label="Filtrar despensa"
      size="small"
      sx={{
        flexWrap: 'wrap',
        gap: 1,
        '& .MuiToggleButtonGroup-grouped': { border: '1px solid', borderRadius: '8px !important' },
      }}
    >
      {filterOptions.map((option) => (
        <ToggleButton key={option.id} value={option.id} sx={{ textTransform: 'none' }}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
