'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { usePreferences } from '@/features/settings/providers/PreferencesProvider';

import { authText } from '../constants/authText';
import { loginDefaultValues, loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import { authService } from '../services/authService';

export interface UseLoginFormResult {
  form: ReturnType<typeof useForm<LoginFormValues>>;
  isSubmitting: boolean;
  isGoogleLoading: boolean;
  submitError: string | null;
  onSubmit: () => void;
  onGoogleSignIn: () => void;
  onCaptchaVerify: (token: string) => void;
  onCaptchaExpire: () => void;
}

/**
 * Owns the login form's validation, submission and Google sign-in
 * flow. Talks to `authService` only through the `AuthService`
 * contract, so this hook is unaffected by which real provider gets
 * wired in later.
 */
export function useLoginForm(): UseLoginFormResult {
  const router = useRouter();
  const { preferences } = usePreferences();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
    mode: 'onBlur',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Google OAuth never needs this — Attack Protection's CAPTCHA only
  // applies to email/password flows, see docs/security.md.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Settings → Geral → "Continuar de onde parei" takes priority over
  // "Página inicial" when there's actually somewhere to resume —
  // `AuthenticatedShell` is what keeps `lastVisitedPage` up to date.
  const destination =
    preferences.general.resumeLastPage && preferences.general.lastVisitedPage
      ? preferences.general.lastVisitedPage
      : preferences.general.homePage;

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await authService.signInWithCredentials(values, captchaToken ?? undefined);
      if (result.success) {
        router.push(destination);
      } else {
        setSubmitError(result.error || authText.login.genericError);
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const onGoogleSignIn = () => {
    setSubmitError(null);
    setIsGoogleLoading(true);
    authService
      .signInWithGoogle()
      .then((result) => {
        if (result.success) {
          router.push(destination);
        } else {
          setSubmitError(result.error || authText.login.genericError);
        }
      })
      .finally(() => setIsGoogleLoading(false));
  };

  return {
    form,
    isSubmitting,
    isGoogleLoading,
    submitError,
    onSubmit,
    onGoogleSignIn,
    onCaptchaVerify: setCaptchaToken,
    onCaptchaExpire: () => setCaptchaToken(null),
  };
}
