'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { KokyuTextField } from '@/design-system/components';
import { missionDurationFilterPresets } from '../../constants/missionDurationPresets';
import { missionPriorityDefinitions } from '../../constants/missionPriorities';
import type { MissionFilters as MissionFiltersValue, MissionPriority } from '../../types';

export interface MissionFiltersBarProps {
  value: MissionFiltersValue;
  onChange: (value: MissionFiltersValue) => void;
}

/** Combines status/priority/duration/etc. filters (spec "FILTROS") — always applied through `missionFilterEngine`, this component only edits the `MissionFilters` object. */
export function MissionFiltersBar({ value, onChange }: MissionFiltersBarProps) {
  function togglePriority(priority: MissionPriority) {
    const current = value.priority ?? [];
    const next = current.includes(priority) ? current.filter((p) => p !== priority) : [...current, priority];
    onChange({ ...value, priority: next.length > 0 ? next : undefined });
  }

  function setDurationMax(max: number | undefined) {
    onChange({ ...value, durationMax: max });
  }

  return (
    <Stack spacing={1.5}>
      <KokyuTextField
        size="small"
        placeholder="Buscar missões…"
        value={value.search ?? ''}
        onChange={(event) => onChange({ ...value, search: event.target.value || undefined })}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }}
        aria-label="Buscar missões"
      />

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {missionPriorityDefinitions.map((definition) => (
          <Chip
            key={definition.id}
            label={definition.label}
            size="small"
            color={value.priority?.includes(definition.id) ? definition.color : 'default'}
            variant={value.priority?.includes(definition.id) ? 'filled' : 'outlined'}
            onClick={() => togglePriority(definition.id)}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {missionDurationFilterPresets.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            size="small"
            color={value.durationMax === preset.max ? 'info' : 'default'}
            variant={value.durationMax === preset.max ? 'filled' : 'outlined'}
            onClick={() => setDurationMax(value.durationMax === preset.max ? undefined : preset.max)}
          />
        ))}
        <Chip
          label="Aguardando"
          size="small"
          color={value.waiting ? 'info' : 'default'}
          variant={value.waiting ? 'filled' : 'outlined'}
          onClick={() => onChange({ ...value, waiting: value.waiting ? undefined : true })}
        />
        <Chip
          label="Bloqueadas"
          size="small"
          color={value.blocked ? 'error' : 'default'}
          variant={value.blocked ? 'filled' : 'outlined'}
          onClick={() => onChange({ ...value, blocked: value.blocked ? undefined : true })}
        />
        <Chip
          label="Recorrentes"
          size="small"
          color={value.recurring ? 'info' : 'default'}
          variant={value.recurring ? 'filled' : 'outlined'}
          onClick={() => onChange({ ...value, recurring: value.recurring ? undefined : true })}
        />
      </Stack>
    </Stack>
  );
}
