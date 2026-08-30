'use client';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';

import { KokyuTextField } from '@/design-system/components';

import { muscleGroupOptions } from '../../constants/muscleGroups';
import type { RoutineFilterOptions } from '../../utils/routineFilters';

export interface RoutineFiltersBarProps {
  filters: RoutineFilterOptions;
  onFiltersChange: (filters: RoutineFilterOptions) => void;
  locationOptions: { value: string; label: string }[];
}

export function RoutineFiltersBar({
  filters,
  onFiltersChange,
  locationOptions,
}: RoutineFiltersBarProps) {
  function handleSelectChange(key: keyof RoutineFilterOptions) {
    return (event: SelectChangeEvent) => {
      const value = event.target.value;
      onFiltersChange({ ...filters, [key]: value === '' ? undefined : value });
    };
  }

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ flexWrap: 'wrap', rowGap: 1.5 }}
    >
      <KokyuTextField
        placeholder="Buscar treino"
        value={filters.search ?? ''}
        onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
        sx={{ maxWidth: { sm: 260 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
          htmlInput: { 'aria-label': 'Buscar treinos' },
        }}
      />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="routine-filter-muscle-label">Músculo</InputLabel>
        <Select
          labelId="routine-filter-muscle-label"
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
        <InputLabel id="routine-filter-location-label">Local</InputLabel>
        <Select
          labelId="routine-filter-location-label"
          label="Local"
          value={filters.locationId ?? ''}
          onChange={handleSelectChange('locationId')}
        >
          <MenuItem value="">Todos</MenuItem>
          {locationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ToggleButton
        value="favoritesOnly"
        selected={Boolean(filters.favoritesOnly)}
        onChange={() => onFiltersChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
        size="small"
        aria-label="Somente favoritos"
      >
        Favoritos
      </ToggleButton>
    </Stack>
  );
}
