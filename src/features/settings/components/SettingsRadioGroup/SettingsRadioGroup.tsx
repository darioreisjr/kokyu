'use client';

import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

export interface SettingsRadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface SettingsRadioGroupProps {
  /** Rendered as a `legend` — every radio group here has a visible, non-optional name. */
  legend: string;
  value: string;
  options: SettingsRadioOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Lays options out as a row on wide screens instead of the default stack — for short 2-3 option groups like "Tema". */
  row?: boolean;
}

/** A labelled `fieldset`/`legend` radio group — used for mutually-exclusive preferences with more than 2-3 states shown at once (e.g. "Tema", "Reduzir movimento"). */
export function SettingsRadioGroup({
  legend,
  value,
  options,
  onChange,
  disabled = false,
  row = false,
}: SettingsRadioGroupProps) {
  return (
    <FormControl component="fieldset" disabled={disabled} sx={{ width: '100%' }}>
      <FormLabel component="legend" sx={{ typography: 'labelLarge', marginBottom: 1 }}>
        {legend}
      </FormLabel>
      <RadioGroup
        value={value}
        onChange={(event) => onChange(event.target.value)}
        row={row}
        sx={{ gap: row ? 2 : 0 }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={
              option.description ? (
                <Stack spacing={0}>
                  <Typography variant="body1">{option.label}</Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  >
                    {option.description}
                  </Typography>
                </Stack>
              ) : (
                option.label
              )
            }
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
