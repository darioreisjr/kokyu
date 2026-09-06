'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { authConfig } from '../constants/authConfig';
import {
  forgotPasswordDefaultValues,
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgotPasswordSchema';
import { passwordRecoveryService } from '../services/passwordRecoveryService';

export type ForgotPasswordStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseForgotPasswordFormResult {
  form: ReturnType<typeof useForm<ForgotPasswordFormValues>>;
  status: ForgotPasswordStatus;
  submittedEmail: string;
  isResending: boolean;
  /** Seconds left before "Enviar novamente" can be used again; `0` means it's available. */
  resendCooldownSeconds: number;
  onSubmit: () => void;
  onResend: () => void;
  onCaptchaVerify: (token: string) => void;
  onCaptchaExpire: () => void;
}

/**
 * Owns the forgot-password form's validation, submission and resend
 * cooldown. Talks to `passwordRecoveryService` only through the
 * `PasswordRecoveryService` contract — same shape as `useLoginForm` /
 * `useCreateAccountForm`.
 *
 * The resend cooldown is plain state ticked by one `setInterval`,
 * decremented through the functional updater form (`(seconds) =>
 * seconds - 1`) rather than read from a captured closure — so it's
 * always correct regardless of how many renders happen in between,
 * and the effect only restarts when cooldown *activity* flips (not
 * once per second), self-clearing the moment it reaches zero. Reading
 * the wall clock (`Date.now()`) during render to derive this instead
 * would make render impure — not just a style preference, the React
 * Compiler rejects it (`react-hooks/purity`).
 */
export function useForgotPasswordForm(): UseForgotPasswordFormResult {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: forgotPasswordDefaultValues,
    mode: 'onBlur',
  });

  const [status, setStatus] = useState<ForgotPasswordStatus>('idle');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const isCoolingDown = resendCooldownSeconds > 0;

  useEffect(() => {
    if (!isCoolingDown) return;

    const intervalId = setInterval(() => {
      setResendCooldownSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isCoolingDown]);

  async function requestRecovery(email: string) {
    const result = await passwordRecoveryService.requestPasswordRecovery(
      { email },
      captchaToken ?? undefined,
    );
    if (result.success) {
      setSubmittedEmail(email);
      setStatus('success');
      setResendCooldownSeconds(authConfig.passwordRecoveryResendCooldownSeconds);
    } else {
      setStatus('error');
    }
  }

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setStatus('loading');
    await requestRecovery(email);
  });

  const onResend = () => {
    if (isResending || isCoolingDown) return;
    setIsResending(true);
    requestRecovery(submittedEmail).finally(() => setIsResending(false));
  };

  return {
    form,
    status,
    submittedEmail,
    isResending,
    resendCooldownSeconds,
    onSubmit,
    onResend,
    onCaptchaVerify: setCaptchaToken,
    onCaptchaExpire: () => setCaptchaToken(null),
  };
}
