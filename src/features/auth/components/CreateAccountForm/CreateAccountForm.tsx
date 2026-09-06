'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import {
  KokyuButton,
  KokyuDateField,
  KokyuPasswordField,
  KokyuTextField,
  KokyuUsernameField,
  type KokyuUsernameFieldStatus,
} from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { authConfig } from '../../constants/authConfig';
import { authText } from '../../constants/authText';
import { useCreateAccountForm } from '../../hooks/useCreateAccountForm';
import type { UsernameAvailability } from '../../types/createAccount.types';
import { PasswordRequirements } from '../PasswordRequirements/PasswordRequirements';
import { PasswordStrength } from '../PasswordStrength/PasswordStrength';
import { Turnstile } from '../Turnstile/Turnstile';

const text = authText.createAccount;

const USERNAME_STATUS_MAP: Record<UsernameAvailability, KokyuUsernameFieldStatus> = {
  idle: 'idle',
  checking: 'loading',
  available: 'success',
  unavailable: 'error',
  error: 'error',
  // Create-account never has an original username to match against —
  // included only so this map stays exhaustive over the shared type.
  unchanged: 'idle',
};

function usernameHelperText(availability: UsernameAvailability): string | undefined {
  switch (availability) {
    case 'checking':
      return authText.username.checking;
    case 'available':
      return authText.username.available;
    case 'unavailable':
      return authText.username.unavailable;
    case 'error':
      return authText.username.error;
    default:
      return undefined;
  }
}

/** Today, 18 years ago — the latest a birth date can be for an eligible account. */
function eighteenYearsAgo(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - authConfig.minAccountAge);
  return date;
}

export function CreateAccountForm() {
  const {
    form: {
      register,
      control,
      formState: { errors },
    },
    isSubmitting,
    isSuccess,
    submitError,
    usernameAvailability,
    onSubmit,
    onCaptchaVerify,
    onCaptchaExpire,
  } = useCreateAccountForm();

  const [passwordTouched, setPasswordTouched] = useState(false);
  const passwordValue = useWatch({ control, name: 'password' }) ?? '';
  const showPasswordFeedback = passwordTouched || passwordValue.length > 0;

  if (isSuccess) {
    return (
      <Stack
        spacing={2}
        role="status"
        sx={{ alignItems: 'center', textAlign: 'center', paddingBlock: 2 }}
      >
        <CheckCircleRoundedIcon
          sx={(theme) => ({ fontSize: 48, color: themePalette(theme).kokyu.feedback.success })}
        />
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
    );
  }

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
      <Stack spacing={2.5}>
        <KokyuTextField
          label={text.emailLabel}
          type="email"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          disabled={isSubmitting}
          {...register('email')}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
          <KokyuTextField
            label={text.firstNameLabel}
            autoComplete="given-name"
            error={Boolean(errors.firstName)}
            helperText={errors.firstName?.message}
            disabled={isSubmitting}
            {...register('firstName')}
          />
          <KokyuTextField
            label={text.lastNameLabel}
            autoComplete="family-name"
            error={Boolean(errors.lastName)}
            helperText={errors.lastName?.message}
            disabled={isSubmitting}
            {...register('lastName')}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
          <KokyuUsernameField
            label={text.usernameLabel}
            autoComplete="username"
            status={USERNAME_STATUS_MAP[usernameAvailability]}
            error={Boolean(errors.username) || usernameAvailability === 'unavailable'}
            helperText={errors.username?.message ?? usernameHelperText(usernameAvailability)}
            disabled={isSubmitting}
            {...register('username')}
          />
          <Controller
            control={control}
            name="birthDate"
            render={({ field, fieldState }) => (
              <KokyuDateField
                label={text.birthDateLabel}
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                maxDate={eighteenYearsAgo()}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </Box>

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
    </Stack>
  );
}
