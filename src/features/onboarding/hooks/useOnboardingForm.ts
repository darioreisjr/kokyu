'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useUsernameAvailability } from '@/features/auth';
import {
  removeAvatarUpload,
  uploadAvatar,
  useAvatarEditor,
  type UseAvatarEditorResult,
} from '@/features/profile';
import { ApiError, friendlyErrorMessage } from '@/lib/api/errors';
import type { CurrentUser, ProfileCompletePayload } from '@/lib/api/types';

import { onboardingText } from '../constants/onboardingText';
import { onboardingSchema, type OnboardingFormValues } from '../schemas/onboardingSchema';
import { onboardingService } from '../services/onboardingService';

function toFormValues(currentUser: CurrentUser): OnboardingFormValues {
  const { profile } = currentUser;
  return {
    firstName: profile.firstName,
    lastName: profile.lastName ?? '',
    username: profile.username ?? '',
    // `birthDateSchema` requires a `Date` — an unset value stays
    // `undefined` here (never a fabricated date) so the field simply
    // renders empty via `KokyuDateField`'s `value={field.value ?? null}`,
    // same as `useCreateAccountForm`'s own unset default.
    birthDate: (profile.birthDate ? new Date(`${profile.birthDate}T00:00:00`) : undefined) as Date,
    bio: profile.bio ?? '',
    country: profile.countryCode ?? '',
    region: profile.region ?? '',
    city: profile.city ?? '',
  };
}

export interface UseOnboardingFormResult {
  form: ReturnType<typeof useForm<OnboardingFormValues>>;
  avatar: UseAvatarEditorResult;
  usernameAvailability: ReturnType<typeof useUsernameAvailability>;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
}

/**
 * Owns the onboarding form's validation, avatar staging and submission.
 * Mirrors `useProfileForm`'s shape closely (this screen is, structurally,
 * "the profile form's required-first, first-time cousin") but never
 * assumes completeness itself: after `completeOnboarding` resolves,
 * navigation to `returnTo` (or `/app` if there wasn't one) happens
 * unconditionally on *success of the request*, not on any
 * locally-computed "now it's complete" guess — a backend that, for
 * some reason, still reports an incomplete profile would simply have
 * the visitor land back on `/perfil/completar` via that route's own
 * server-side check on the next load.
 */
export function useOnboardingForm(
  currentUser: CurrentUser,
  returnTo: string | null = null,
): UseOnboardingFormResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: toFormValues(currentUser),
    mode: 'onBlur',
  });

  const avatar = useAvatarEditor(currentUser.profile.avatarUrl);

  // Skips the availability call entirely when editing an
  // already-complete profile without touching the username (see
  // `useUsernameAvailability`'s own `originalUsername` handling) — not
  // the common onboarding path, but a returning visitor who abandoned
  // onboarding partway and comes back to a prefilled username shouldn't
  // re-trigger a check for a value that's already theirs.
  const originalUsername = currentUser.profile.username ?? undefined;
  const username = useWatch({ control: form.control, name: 'username' });
  const usernameAvailability = useUsernameAvailability(username ?? '', originalUsername);

  const onSubmit = form.handleSubmit(async (values) => {
    if (usernameAvailability === 'unavailable') {
      form.setError('username', { message: onboardingText.usernameTakenOnSubmit });
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (avatar.pendingChange?.type === 'upload') {
        await uploadAvatar(avatar.pendingChange.blob, { suppressProfileSetupRedirect: true });
      } else if (avatar.pendingChange?.type === 'remove') {
        await removeAvatarUpload({ suppressProfileSetupRedirect: true });
      }

      const payload: ProfileCompletePayload = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        birthDate: format(values.birthDate, 'yyyy-MM-dd'),
        bio: values.bio || undefined,
        countryCode: values.country || undefined,
        region: values.region || undefined,
        city: values.city || undefined,
      };

      await onboardingService.completeOnboarding(payload);
      router.replace(returnTo ?? '/app');
      router.refresh();
    } catch (error) {
      // The race the spec calls out: availability said "available", but
      // the backend's own uniqueness check at submit time says
      // otherwise (someone else took it in between). Surfaced on the
      // field itself, exactly like any other field-level validation
      // error — never a crash, never a silent submit "success".
      if (error instanceof ApiError && error.code === 'USERNAME_TAKEN') {
        form.setError('username', {
          message: friendlyErrorMessage(error, onboardingText.usernameTakenOnSubmit),
        });
      } else {
        setSubmitError(friendlyErrorMessage(error, onboardingText.genericError));
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return { form, avatar, usernameAvailability, isSubmitting, submitError, onSubmit };
}
