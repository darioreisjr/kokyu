import TextField, { type TextFieldProps } from '@mui/material/TextField';

export type KokyuTextFieldProps = Omit<TextFieldProps, 'variant'>;

/**
 * Kokyu's base text input. Locks the variant to `outlined` — the only
 * style the Design System supports — and relies entirely on the
 * `MuiOutlinedInput` theme overrides for color, radius and focus ring.
 */
export function KokyuTextField(props: KokyuTextFieldProps) {
  return <TextField variant="outlined" fullWidth {...props} />;
}
