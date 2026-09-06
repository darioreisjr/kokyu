'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { KokyuButton, KokyuPasswordField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { authText } from '../../constants/authText';
import { useResetPasswordForm } from '../../hooks/useResetPasswordForm';
import { PasswordRequirements } from '../PasswordRequirements/PasswordRequirements';
import { PasswordStrength } from '../PasswordStrength/PasswordStrength';

const text = authText.resetPassword;

export interface ResetPasswordFormProps {
  /**
   * Whether `/auth/callback` already exchanged a recovery link for an
   * active session before this rendered — `updateUser` requires one.
   * Decided by the page (a Server Component checking `getUser()`), not
   * by this form, so it stays a single source of truth per request.
   */
  hasValidSession: boolean;
}

export function ResetPasswordForm({ hasValidSession }: ResetPasswordFormProps) {
  const {
    form: {
      register,
      control,
      formState: { errors },
    },
    isSubmitting,
    isSuccess,
    submitError,
    onSubmit,
  } = useResetPasswordForm();

  const [passwordTouched, setPasswordTouched] = useState(false);
  const passwordValue = useWatch({ control, name: 'password' }) ?? '';
  const showPasswordFeedback = passwordTouched || passwordValue.length > 0;

  if (!hasValidSession) {
    return (
      <Stack spacing={3} role="status" sx={{ alignItems: 'center', textAlign: 'center' }}>
        <ErrorOutlineRoundedIcon
          sx={(theme) => ({ fontSize: 48, color: themePalette(theme).kokyu.feedback.error })}
        />
        <Stack spacing={1}>
          <Typography variant="h3" component="p">
            {text.invalidLinkTitle}
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {text.invalidLinkDescription}
          </Typography>
        </Stack>
        <Button
          component={NextLink}
          href="/forgot-password"
          variant="contained"
          size="large"
          fullWidth
        >
          {text.requestNewLink}
        </Button>
      </Stack>
    );
  }

  if (isSuccess) {
    return (
      <Stack spacing={3} role="status" sx={{ alignItems: 'center', textAlign: 'center' }}>
        <CheckCircleRoundedIcon
          sx={(theme) => ({ fontSize: 48, color: themePalette(theme).kokyu.feedback.success })}
        />
        <Stack spacing={1}>
          <Typography variant="h3" component="p">
            {text.successTitle}
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {text.successDescription}
          </Typography>
        </Stack>
        <Button component={NextLink} href="/login" variant="contained" size="large" fullWidth>
          {text.goToLogin}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
      <Stack spacing={1.5}>
        <KokyuPasswordField
          label={text.passwordLabel}
          autoComplete="new-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          disabled={isSubmitting}
          {...register('password', {
            onChange: () => setPasswordTouched(true),
            onBlur: () => setPasswordTouched(true),
          })}
        />
        {showPasswordFeedback ? (
          <Stack spacing={1.25} sx={{ paddingInlineStart: 0.5 }}>
            <PasswordStrength password={passwordValue} />
            <PasswordRequirements password={passwordValue} />
          </Stack>
        ) : null}
      </Stack>

      <KokyuPasswordField
        label={text.confirmPasswordLabel}
        autoComplete="new-password"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
        disabled={isSubmitting}
        {...register('confirmPassword')}
      />

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
    </Stack>
  );
}
