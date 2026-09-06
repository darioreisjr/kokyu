'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { authText } from '../constants/authText';
import { createAccountSchema, type CreateAccountFormValues } from '../schemas/createAccountSchema';
import { createAccountService, mapFormDataToPayload } from '../services/createAccountService';
import { useUsernameAvailability } from './useUsernameAvailability';

export interface UseCreateAccountFormResult {
  form: ReturnType<typeof useForm<CreateAccountFormValues>>;
  isSubmitting: boolean;
  isSuccess: boolean;
  submitError: string | null;
  usernameAvailability: ReturnType<typeof useUsernameAvailability>;
  onSubmit: () => void;
  onCaptchaVerify: (token: string) => void;
  onCaptchaExpire: () => void;
}

/**
 * Owns create-account validation, the debounced username-availability
 * check and submission. Talks to `createAccountService` only through
 * the `CreateAccountService` contract — same shape as `useLoginForm`.
 */
export function useCreateAccountForm(): UseCreateAccountFormResult {
  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    // `birthDate` starts unset (the date field renders it as `null`);
    // the schema — not this default — is what makes it required.
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const username = useWatch({ control: form.control, name: 'username' });
  const usernameAvailability = useUsernameAvailability(username);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    if (usernameAvailability === 'unavailable') {
      form.setError('username', { message: authText.username.unavailable });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = mapFormDataToPayload(values);
      const result = await createAccountService.createAccount(payload, captchaToken ?? undefined);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setSubmitError(result.error || authText.createAccount.genericError);
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    isSubmitting,
    isSuccess,
    submitError,
    usernameAvailability,
    onSubmit,
    onCaptchaVerify: setCaptchaToken,
    onCaptchaExpire: () => setCaptchaToken(null),
  };
}
