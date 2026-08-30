'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

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

const text = authText.login;

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
  } = useLoginForm();

  const anyLoading = isSubmitting || isGoogleLoading;

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
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
