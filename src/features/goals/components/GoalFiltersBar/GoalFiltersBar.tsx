'use client';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { KokyuTextField } from '@/design-system/components';

import { goalAreaDefinitions } from '../../constants/goalAreas';
import { goalPriorityOptions } from '../../constants/goalPriorities';
import { goalStatusLabels } from '../../constants/goalStatusLabels';
import type { GoalFilterOptions, GoalQuickFilter, GoalSortOption } from '../../utils/goalFilters';

export type GoalViewMode = 'cards' | 'list';

export interface GoalFiltersBarProps {
  filters: GoalFilterOptions;
  onFiltersChange: (filters: GoalFilterOptions) => void;
  sortBy: GoalSortOption;
  onSortByChange: (sortBy: GoalSortOption) => void;
  viewMode?: GoalViewMode;
  onViewModeChange?: (mode: GoalViewMode) => void;
}

const quickFilterOptions: { id: GoalQuickFilter; label: string }[] = [
  { id: 'focus', label: 'Foco' },
  { id: 'onTrack', label: 'No ritmo' },
  { id: 'attention', label: 'Atenção' },
  { id: 'atRisk', label: 'Em risco' },
  { id: 'noUpdate', label: 'Sem atualização' },
  { id: 'dueSoon', label: 'Prazo próximo' },
];

const sortOptions: { id: GoalSortOption; label: string }[] = [
  { id: 'priority', label: 'Prioridade' },
  { id: 'progress', label: 'Progresso' },
  { id: 'deadline', label: 'Prazo' },
  { id: 'updated', label: 'Atualizado recentemente' },
  { id: 'risk', label: 'Risco' },
  { id: 'title', label: 'Título' },
];

/** Filtros/busca/ordenação/visualização compartilhados pelas listas de Metas — nenhuma página reimplementa sua própria lógica de filtro na UI (a lógica em si vive em `utils/goalFilters.ts`, puramente testável). */
export function GoalFiltersBar({
  filters,
  onFiltersChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}: GoalFiltersBarProps) {
  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <KokyuTextField
          label="Buscar metas"
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
          }}
          sx={{ flex: 1 }}
        />
        <KokyuTextField
          select
          label="Área"
          size="small"
          value={filters.area ?? ''}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              area: (event.target.value || undefined) as GoalFilterOptions['area'],
            })
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {goalAreaDefinitions.map((area) => (
            <MenuItem key={area.id} value={area.id}>
              {area.label}
            </MenuItem>
          ))}
        </KokyuTextField>
        <KokyuTextField
          select
          label="Prioridade"
          size="small"
          value={filters.priority ?? ''}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              priority: (event.target.value || undefined) as GoalFilterOptions['priority'],
            })
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {goalPriorityOptions.map((priority) => (
            <MenuItem key={priority.id} value={priority.id}>
              {priority.label}
            </MenuItem>
          ))}
        </KokyuTextField>
        <KokyuTextField
          select
          label="Status"
          size="small"
          value={filters.status ?? ''}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              status: (event.target.value || undefined) as GoalFilterOptions['status'],
            })
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(Object.keys(goalStatusLabels) as (keyof typeof goalStatusLabels)[]).map((statusId) => (
            <MenuItem key={statusId} value={statusId}>
              {goalStatusLabels[statusId]}
            </MenuItem>
          ))}
        </KokyuTextField>
        <KokyuTextField
          select
          label="Fonte"
          size="small"
          value={filters.source ?? ''}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              source: (event.target.value || undefined) as GoalFilterOptions['source'],
            })
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="manual">Manual</MenuItem>
          <MenuItem value="automatic">Automática</MenuItem>
        </KokyuTextField>
        <KokyuTextField
          select
          label="Ordenar por"
          size="small"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as GoalSortOption)}
          sx={{ minWidth: 180 }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </KokyuTextField>
        {onViewModeChange ? (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_event, next: GoalViewMode | null) => next && onViewModeChange(next)}
            aria-label="Modo de visualização"
            size="small"
          >
            <ToggleButton value="cards" aria-label="Cards">
              <GridViewRoundedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="Lista">
              <ViewListRoundedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        ) : null}
      </Stack>

      <ToggleButtonGroup
        value={filters.quickFilter ?? null}
        exclusive
        onChange={(_event, next: GoalQuickFilter | null) =>
          onFiltersChange({ ...filters, quickFilter: next ?? undefined })
        }
        aria-label="Filtros rápidos"
        size="small"
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          '& .MuiToggleButtonGroup-grouped': {
            border: '1px solid',
            borderRadius: '8px !important',
          },
        }}
      >
        {quickFilterOptions.map((option) => (
          <ToggleButton key={option.id} value={option.id} sx={{ textTransform: 'none' }}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}
