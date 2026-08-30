import Button, { type ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export interface KokyuButtonProps extends ButtonProps {
  /** Shows a spinner and disables the button while an action is pending. */
  loading?: boolean;
  /** Accessible label announced while `loading` is true. @default 'Carregando' */
  loadingLabel?: string;
}

/**
 * Kokyu's primary call-to-action button. Wraps MUI's Button so every
 * screen gets consistent height, radius and loading behavior from the
 * Design System instead of ad-hoc `sx` overrides.
 */
export function KokyuButton({
  loading = false,
  loadingLabel = 'Carregando',
  disabled,
  children,
  startIcon,
  variant = 'contained',
  ...props
}: KokyuButtonProps) {
  return (
    <Button
      variant={variant}
      disabled={disabled ?? loading}
      startIcon={loading ? undefined : startIcon}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress
            size={20}
            thickness={5}
            color="inherit"
            sx={{ marginInlineEnd: 1.25 }}
          />
          <span role="status">{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
