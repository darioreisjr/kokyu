'use client';

import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useEffect, useRef } from 'react';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { authText } from '../../constants/authText';

const text = authText.forgotPassword;

export interface PasswordRecoverySuccessProps {
  email: string;
  isResending: boolean;
  /** Seconds left before "Enviar novamente" can be used again; `0` means it's available. */
  resendCooldownSeconds: number;
  onResend: () => void;
}

/**
 * The confirmation state `ForgotPasswordForm` swaps in after a
 * successful request — a distinct state of the feature, not a variant
 * of the form, so it gets its own component per the spec. Its heading
 * is a real, focusable `<h2>`: unlike `CreateAccountForm`'s inline
 * success paragraph (which relies on `role="status"` alone), this
 * screen is explicitly required to move keyboard/AT focus onto it, so
 * screen reader users reliably notice the state change.
 */
export function PasswordRecoverySuccess({
  email,
  isResending,
  resendCooldownSeconds,
  onResend,
}: PasswordRecoverySuccessProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const resendDisabled = isResending || resendCooldownSeconds > 0;
  const resendLabel =
    resendCooldownSeconds > 0 ? text.resendCooldown(resendCooldownSeconds) : text.resend;

  return (
    <Stack spacing={3} role="status" sx={{ alignItems: 'center', textAlign: 'center' }}>
      <MarkEmailReadRoundedIcon
        sx={(theme) => ({ fontSize: 48, color: themePalette(theme).kokyu.feedback.success })}
      />

      <Stack spacing={1}>
        <Typography
          ref={headingRef}
          id="password-recovery-success-heading"
          tabIndex={-1}
          variant="h3"
          component="h2"
          sx={(theme) => ({
            borderRadius: 1,
            '&:focus-visible': {
              outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
              outlineOffset: 4,
            },
          })}
        >
          {text.successTitle}
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {text.successDescription}
        </Typography>
        <Typography
          variant="labelLarge"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.primary })}
        >
          {email}
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ width: '100%' }}>
        <Button component={NextLink} href="/login" variant="contained" size="large" fullWidth>
          {text.backToLogin}
        </Button>
        <KokyuButton
          type="button"
          variant="text"
          size="large"
          fullWidth
          loading={isResending}
          loadingLabel={text.resendLoading}
          disabled={resendDisabled}
          onClick={onResend}
        >
          {resendLabel}
        </KokyuButton>
      </Stack>
    </Stack>
  );
}
