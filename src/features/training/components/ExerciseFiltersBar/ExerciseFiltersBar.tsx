'use client';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { KokyuTextField } from '@/design-system/components';

import { exerciseTypeOptions } from '../../constants/exerciseCategories';
import { muscleGroupOptions } from '../../constants/muscleGroups';
import type { ExerciseFilterOptions } from '../../utils/exerciseFilters';

export interface ExerciseFiltersBarProps {
  filters: ExerciseFilterOptions;
  onFiltersChange: (filters: ExerciseFilterOptions) => void;
  equipmentOptions: { value: string; label: string }[];
}

type QuickFilter = 'favoritesOnly' | 'createdByUserOnly';

export function ExerciseFiltersBar({
  filters,
  onFiltersChange,
  equipmentOptions,
}: ExerciseFiltersBarProps) {
  const activeQuickFilters: QuickFilter[] = [
    ...(filters.favoritesOnly ? (['favoritesOnly'] as const) : []),
    ...(filters.createdByUserOnly ? (['createdByUserOnly'] as const) : []),
  ];

  function handleSelectChange(key: keyof ExerciseFilterOptions) {
    return (event: SelectChangeEvent) => {
      const value = event.target.value;
      onFiltersChange({ ...filters, [key]: value === '' ? undefined : value });
    };
  }

  function handleQuickFilterChange(_event: unknown, next: QuickFilter[]) {
    onFiltersChange({
      ...filters,
      favoritesOnly: next.includes('favoritesOnly'),
      createdByUserOnly: next.includes('createdByUserOnly'),
    });
  }

  return (
    <Stack spacing={1.5}>
      <KokyuTextField
        placeholder="Buscar exercício, músculo ou equipamento"
        value={filters.search ?? ''}
        onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
          htmlInput: { 'aria-label': 'Buscar exercícios' },
        }}
      />
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="exercise-filter-muscle-label">Músculo</InputLabel>
          <Select
            labelId="exercise-filter-muscle-label"
            label="Músculo"
            value={filters.muscleGroup ?? ''}
            onChange={handleSelectChange('muscleGroup')}
          >
            <MenuItem value="">Todos</MenuItem>
            {muscleGroupOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="exercise-filter-equipment-label">Equipamento</InputLabel>
          <Select
            labelId="exercise-filter-equipment-label"
            label="Equipamento"
            value={filters.equipmentId ?? ''}
            onChange={handleSelectChange('equipmentId')}
          >
            <MenuItem value="">Todos</MenuItem>
            {equipmentOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="exercise-filter-type-label">Tipo</InputLabel>
          <Select
            labelId="exercise-filter-type-label"
            label="Tipo"
            value={filters.exerciseType ?? ''}
            onChange={handleSelectChange('exerciseType')}
          >
            <MenuItem value="">Todos</MenuItem>
            {exerciseTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={activeQuickFilters}
          onChange={handleQuickFilterChange}
          size="small"
          aria-label="Filtros rápidos"
        >
          <ToggleButton value="favoritesOnly" aria-label="Somente favoritos">
            Favoritos
          </ToggleButton>
          <ToggleButton value="createdByUserOnly" aria-label="Somente criados por mim">
            Criados por mim
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}
