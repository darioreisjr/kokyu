'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { authText } from '../constants/authText';
import {
  resetPasswordDefaultValues,
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/resetPasswordSchema';
import { passwordRecoveryService } from '../services/passwordRecoveryService';

export interface UseResetPasswordFormResult {
  form: ReturnType<typeof useForm<ResetPasswordFormValues>>;
  isSubmitting: boolean;
  isSuccess: boolean;
  submitError: string | null;
  onSubmit: () => void;
}

/**
 * Owns the reset-password form's validation and submission. Talks to
 * `passwordRecoveryService` only through its contract — same shape as
 * `useLoginForm`/`useCreateAccountForm`. Assumes the caller has already
 * confirmed a valid recovery session exists (see `ResetPasswordForm`'s
 * `hasValidSession` prop) — `updatePassword` operates on whatever
 * session is currently active.
 */
export function useResetPasswordForm(): UseResetPasswordFormResult {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: resetPasswordDefaultValues,
    mode: 'onBlur',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await passwordRecoveryService.updatePassword(password);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setSubmitError(result.error || authText.resetPassword.genericError);
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return { form, isSubmitting, isSuccess, submitError, onSubmit };
}
