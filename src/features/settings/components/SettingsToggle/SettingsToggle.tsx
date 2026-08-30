'use client';

import Switch, { type SwitchProps } from '@mui/material/Switch';

export interface SettingsToggleProps extends Omit<SwitchProps, 'checked' | 'onChange'> {
  /** The switch's accessible name — pass the same text as the owning `SettingsRow`'s `title`. */
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** A `Switch` that always carries its own accessible name — "Switch isolado sem contexto" is exactly what `label` prevents. */
export function SettingsToggle({ label, checked, onChange, ...props }: SettingsToggleProps) {
  return (
    <Switch
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      slotProps={{ input: { 'aria-label': label } }}
      {...props}
    />
  );
}
