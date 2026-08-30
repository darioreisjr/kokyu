import Checkbox, { type CheckboxProps } from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export interface KokyuCheckboxProps extends CheckboxProps {
  label: ReactNode;
}

/** Checkbox with its label wired up for a single accessible click/tap target. */
export function KokyuCheckbox({ label, ...props }: KokyuCheckboxProps) {
  return (
    <FormControlLabel
      control={<Checkbox {...props} />}
      label={<Typography variant="body2">{label}</Typography>}
    />
  );
}
