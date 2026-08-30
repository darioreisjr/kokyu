// Theme-callback `sx` can't cross a Server → Client boundary as a
// prop, so this needs to be a Client Component even without state.
'use client';

import Box from '@mui/material/Box';

import { themePalette } from '../../theme/useThemePalette';
import { KokyuButton, type KokyuButtonProps } from '../KokyuButton/KokyuButton';

export type KokyuGoogleButtonProps = Omit<KokyuButtonProps, 'variant' | 'color' | 'startIcon'>;

function GoogleIcon() {
  return (
    <Box component="svg" viewBox="0 0 18 18" width={18} height={18} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </Box>
  );
}

/**
 * Google sign-in button. Deliberately kept neutral (light surface,
 * standard multi-color "G") to match Google's own branding guidance —
 * it does not know about, and never talks directly to, an auth
 * provider. See `features/auth/services` for the pluggable contract.
 */
export function KokyuGoogleButton({
  children = 'Continuar com Google',
  ...props
}: KokyuGoogleButtonProps) {
  return (
    <KokyuButton
      variant="outlined"
      color="inherit"
      startIcon={<GoogleIcon />}
      sx={[
        (theme) => ({
          backgroundColor: themePalette(theme).kokyu.surface.inverse,
          color: themePalette(theme).kokyu.text.inverse,
          borderColor: themePalette(theme).kokyu.border.default,
          '&:hover': {
            backgroundColor: themePalette(theme).kokyu.surface.inverse,
            borderColor: themePalette(theme).kokyu.border.strong,
          },
        }),
        ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
      ]}
      {...props}
    >
      {children}
    </KokyuButton>
  );
}
