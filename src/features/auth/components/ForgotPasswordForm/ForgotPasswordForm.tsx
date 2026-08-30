'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import { authText } from '../../constants/authText';
import { useForgotPasswordForm } from '../../hooks/useForgotPasswordForm';
import { PasswordRecoverySuccess } from '../PasswordRecoverySuccess/PasswordRecoverySuccess';

const text = authText.forgotPassword;

export function ForgotPasswordForm() {
  const {
    form: {
      register,
      formState: { errors },
    },
    status,
    submittedEmail,
    isResending,
    resendCooldownSeconds,
    onSubmit,
    onResend,
  } = useForgotPasswordForm();

  if (status === 'success') {
    return (
      <PasswordRecoverySuccess
        email={submittedEmail}
        isResending={isResending}
        resendCooldownSeconds={resendCooldownSeconds}
        onResend={onResend}
      />
    );
  }

  const isSubmitting = status === 'loading';

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
      <KokyuTextField
        label={text.emailLabel}
        type="email"
        autoComplete="email"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        disabled={isSubmitting}
        {...register('email')}
      />

      {status === 'error' ? <Alert severity="error">{text.genericError}</Alert> : null}

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
