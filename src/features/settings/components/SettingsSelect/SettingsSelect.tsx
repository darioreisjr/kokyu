'use client';

import MenuItem from '@mui/material/MenuItem';

import { KokyuTextField } from '@/design-system/components/KokyuTextField/KokyuTextField';

export interface SettingsSelectOption {
  value: string;
  label: string;
}

export interface SettingsSelectProps {
  /** Accessible name for the field — pass the same text as the owning `SettingsRow`'s `title`. */
  label: string;
  value: string;
  options: SettingsSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Hides the visible label, keeping it for screen readers — use when `SettingsRow`'s own title already names the field. */
  hideLabel?: boolean;
}

/** A compact `select` for one settings row's value — every preference dropdown in this feature goes through here. */
export function SettingsSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  hideLabel = false,
}: SettingsSelectProps) {
  return (
    <KokyuTextField
      select
      label={hideLabel ? undefined : label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      size="small"
      // A top-level `aria-label` on `TextField` only ever reaches the
      // outer `FormControl` wrapper, not the interactive combobox
      // MUI's `Select` renders — `slotProps.select` is the one that
      // actually lands on that element, which is what a screen reader
      // (or `getByRole('combobox', { name })`) reads as its name.
      slotProps={hideLabel ? { select: { 'aria-label': label } } : undefined}
      sx={{ minWidth: { xs: '100%', sm: 220 } }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </KokyuTextField>
  );
}
