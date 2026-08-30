import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { ReactNode } from 'react';

export interface KokyuDateFieldProps {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  onBlur?: () => void;
  name?: string;
  error?: boolean;
  helperText?: ReactNode;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
}

/**
 * Kokyu's date input — a thin, ergonomic wrapper around MUI X's
 * `DatePicker`, fixed to the `dd/MM/yyyy` display format regardless
 * of the browser's locale (a native `<input type="date">` can't
 * guarantee that) and styled entirely through the Kokyu theme's
 * `MuiOutlinedInput` overrides, same as `KokyuTextField`.
 */
export function KokyuDateField({
  label,
  value,
  onChange,
  onBlur,
  name,
  error,
  helperText,
  disabled,
  maxDate,
  minDate,
}: KokyuDateFieldProps) {
  return (
    <DatePicker
      label={label}
      value={value}
      onChange={onChange}
      format="dd/MM/yyyy"
      disabled={disabled}
      maxDate={maxDate}
      minDate={minDate}
      slotProps={{
        textField: {
          fullWidth: true,
          name,
          onBlur,
          error,
          helperText,
        },
      }}
    />
  );
}
