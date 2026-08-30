'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { useUsernameAvailability } from '@/features/auth';

import { profileSchema, type ProfileFormValues } from '../schemas/profileSchema';
import { mapFormDataToPayload, profileService } from '../services/profileService';
import type { UserProfile } from '../types/profile.types';
import { useAvatarEditor, type UseAvatarEditorResult } from './useAvatarEditor';

const GENERIC_SAVE_ERROR = 'Não foi possível atualizar seu perfil. Tente novamente.';

function toFormValues(profile: UserProfile): ProfileFormValues {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    bio: profile.bio,
    birthDate: profile.birthDate,
    country: profile.country,
    region: profile.region,
    city: profile.city,
  };
}

export interface UseProfileFormResult {
  profile: UserProfile;
  form: ReturnType<typeof useForm<ProfileFormValues>>;
  avatar: UseAvatarEditorResult;
  usernameAvailability: ReturnType<typeof useUsernameAvailability>;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  onSubmit: () => void;
  onDiscard: () => void;
}

/**
 * Owns the interactive part of the profile page — form validation,
 * submission and avatar staging — given an already-loaded `profile`.
 * Loading the profile itself is `ProfilePage`'s job (kept separate so
 * this hook, and `ProfileForm`, can be exercised — in tests and
 * Storybook — with a plain `profile` value, no async fetch involved).
 *
 * Avatar changes are staged by `useAvatarEditor` and only actually
 * persisted (via `updateAvatar`/`removeAvatar`) here, in the same save
 * as the rest of the form — an unsaved avatar crop must discard
 * exactly like an unsaved text field.
 */
export function useProfileForm(profile: UserProfile): UseProfileFormResult {
  const { showSuccess } = useSnackbar();
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(profile),
    mode: 'onBlur',
  });

  const avatar = useAvatarEditor(currentProfile.avatarUrl);

  const username = useWatch({ control: form.control, name: 'username' });
  const usernameAvailability = useUsernameAvailability(username ?? '', currentProfile.username);

  const isDirty = form.formState.isDirty || avatar.isDirty;

  const onSubmit = form.handleSubmit(async (values) => {
    if (usernameAvailability === 'unavailable') {
      form.setError('username', { message: 'Este username já está em uso.' });
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      // Always the fixed, generic message on failure — never the
      // service's own `error` string. Unlike `useLoginForm`'s
      // "service message or fallback" pattern, the profile spec is
      // explicit: never expose technical detail here, regardless of
      // what a future real backend's error actually says.
      if (avatar.pendingChange?.type === 'upload') {
        const avatarResult = await profileService.updateAvatar(avatar.pendingChange.blob);
        if (!avatarResult.success) {
          setSaveError(GENERIC_SAVE_ERROR);
          return;
        }
      } else if (avatar.pendingChange?.type === 'remove') {
        const removeResult = await profileService.removeAvatar();
        if (!removeResult.success) {
          setSaveError(GENERIC_SAVE_ERROR);
          return;
        }
      }

      const result = await profileService.updateProfile(mapFormDataToPayload(values));
      if (!result.success) {
        setSaveError(GENERIC_SAVE_ERROR);
        return;
      }

      setCurrentProfile(result.profile);
      form.reset(toFormValues(result.profile));
      avatar.reset();
      showSuccess('Perfil atualizado com sucesso.');
    } finally {
      setIsSaving(false);
    }
  });

  const onDiscard = () => {
    form.reset(toFormValues(currentProfile));
    avatar.reset();
    setSaveError(null);
  };

  return {
    profile: currentProfile,
    form,
    avatar,
    usernameAvailability,
    isDirty,
    isSaving,
    saveError,
    onSubmit,
    onDiscard,
  };
}
