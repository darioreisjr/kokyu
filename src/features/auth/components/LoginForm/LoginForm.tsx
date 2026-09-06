'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import {
  KokyuButton,
  KokyuCheckbox,
  KokyuDivider,
  KokyuGoogleButton,
  KokyuLink,
  KokyuPasswordField,
  KokyuTextField,
} from '@/design-system/components';

import { authText } from '../../constants/authText';
import { useLoginForm } from '../../hooks/useLoginForm';
import { Turnstile } from '../Turnstile/Turnstile';

const text = authText.login;

/**
 * `/auth/callback` redirects here with `?error=auth_callback_failed`
 * when it can't exchange a Google OAuth or recovery-link code for a
 * session — e.g. the user cancelled the Google consent screen, or a
 * recovery link expired before the callback ran. Isolated into its own
 * `useSearchParams()` reader (wrapped in its own `<Suspense>` below)
 * rather than called directly in `LoginForm`, so only this small piece
 * opts into dynamic rendering instead of the whole form.
 */
function CallbackErrorAlert() {
  const searchParams = useSearchParams();
  if (searchParams.get('error') !== 'auth_callback_failed') return null;
  return <Alert severity="error">{text.callbackError}</Alert>;
}

export function LoginForm() {
  const {
    form: {
      register,
      formState: { errors },
    },
    isSubmitting,
    isGoogleLoading,
    submitError,
    onSubmit,
    onGoogleSignIn,
    onCaptchaVerify,
    onCaptchaExpire,
  } = useLoginForm();

  const anyLoading = isSubmitting || isGoogleLoading;

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
      <Suspense fallback={null}>
        <CallbackErrorAlert />
      </Suspense>

      <Stack spacing={2.5}>
        <KokyuTextField
          label={text.emailLabel}
          type="email"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          disabled={anyLoading}
          {...register('email')}
        />
        <KokyuPasswordField
          label={text.passwordLabel}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          disabled={anyLoading}
          {...register('password')}
        />
      </Stack>

      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 1 }}
      >
        <KokyuCheckbox label={text.rememberMe} disabled={anyLoading} {...register('rememberMe')} />
        <KokyuLink href="/forgot-password" variant="body2">
          {text.forgotPassword}
        </KokyuLink>
      </Stack>

      <Turnstile onVerify={onCaptchaVerify} onExpire={onCaptchaExpire} />

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <KokyuButton
        type="submit"
        size="large"
        fullWidth
        loading={isSubmitting}
        loadingLabel={text.submitLoading}
      >
        {text.submit}
      </KokyuButton>

      <KokyuDivider>{text.dividerLabel}</KokyuDivider>

      <KokyuGoogleButton
        size="large"
        fullWidth
        loading={isGoogleLoading}
        onClick={onGoogleSignIn}
        disabled={isSubmitting}
      >
        {text.googleButton}
      </KokyuGoogleButton>
    </Stack>
  );
}
