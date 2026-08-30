// Theme-callback `sx` can't cross a Server → Client boundary as a
// prop, so this needs to be a Client Component even without state.
'use client';

import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';

import { themePalette } from '../../theme/useThemePalette';
import { KokyuTextField, type KokyuTextFieldProps } from '../KokyuTextField/KokyuTextField';

export type KokyuUsernameFieldStatus = 'idle' | 'loading' | 'success' | 'error';

export interface KokyuUsernameFieldProps extends Omit<KokyuTextFieldProps, 'type'> {
  /** Drives the end-adornment icon — the caller maps its own domain status onto this. */
  status?: KokyuUsernameFieldStatus;
}

/**
 * Text field specialized for a public username: a visual `@` prefix
 * that never becomes part of the input's value, plus a status
 * end-adornment for an async availability check. Not a generic
 * text field wrapper — it exists because this exact pairing repeats
 * (create account today, profile settings later).
 */
export function KokyuUsernameField({ status = 'idle', ...props }: KokyuUsernameFieldProps) {
  return (
    <KokyuTextField
      type="text"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Typography
                component="span"
                variant="body1"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                @
              </Typography>
            </InputAdornment>
          ),
          endAdornment:
            status === 'idle' ? undefined : (
              <InputAdornment position="end">
                <StatusIcon status={status} />
              </InputAdornment>
            ),
        },
      }}
      {...props}
    />
  );
}

function StatusIcon({ status }: { status: KokyuUsernameFieldStatus }) {
  if (status === 'loading') {
    return <CircularProgress size={18} thickness={5} aria-hidden="true" />;
  }
  if (status === 'success') {
    return (
      <CheckCircleRoundedIcon
        fontSize="small"
        aria-hidden="true"
        sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.success })}
      />
    );
  }
  return (
    <CancelRoundedIcon
      fontSize="small"
      aria-hidden="true"
      sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.error })}
    />
  );
}
