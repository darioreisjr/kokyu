'use client';

import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { habitAreaDefinitions } from '../../constants/habitAreas';
import type {
  HabitFilterState,
  HabitQuickFilter,
  HabitSortOption,
} from '../../constants/habitFilters';
import type { HabitArea } from '../../types/habit.types';

export interface HabitFiltersBarProps {
  filters: HabitFilterState;
  onChange: (patch: Partial<HabitFilterState>) => void;
}

const QUICK_FILTERS: { id: HabitQuickFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'today', label: 'Agendados Hoje' },
  { id: 'morning', label: 'Manhã' },
  { id: 'automatic', label: 'Automáticos' },
  { id: 'needsAttention', label: 'Abaixo de 70%' },
  { id: 'paused', label: 'Em pausa' },
  { id: 'reduce', label: 'Para reduzir' },
];

export function HabitFiltersBar({ filters, onChange }: HabitFiltersBarProps) {
  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'stretch', md: 'center' },
        }}
      >
        <TextField
          placeholder="Buscar hábitos..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1 }}
        />

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filters.area}
              onChange={(e) => onChange({ area: e.target.value as HabitArea | 'all' })}
              displayEmpty
            >
              <MenuItem value="all">Todas as Áreas</MenuItem>
              {habitAreaDefinitions.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  {area.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value as HabitSortOption })}
            >
              <MenuItem value="manual">Ordem padrão</MenuItem>
              <MenuItem value="name">Nome (A-Z)</MenuItem>
              <MenuItem value="consistency">Maior consistência</MenuItem>
              <MenuItem value="streak">Maior sequência</MenuItem>
              <MenuItem value="recent">Mais recentes</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {QUICK_FILTERS.map((qf) => {
          const isSelected = filters.quickFilter === qf.id;
          return (
            <Chip
              key={qf.id}
              label={qf.label}
              clickable
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => onChange({ quickFilter: qf.id })}
              size="small"
              sx={{ mb: 0.5 }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
