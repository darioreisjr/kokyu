'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';

import {
  KokyuTextField,
  KokyuUsernameField,
  type KokyuUsernameFieldStatus,
} from '@/design-system/components';
import { authText, type UsernameAvailability } from '@/features/auth';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { profileConfig } from '../../constants/profileConfig';
import { useHasMounted } from '../../hooks/useHasMounted';
import type { ProfileFormValues } from '../../schemas/profileSchema';

export interface ProfileIdentityFormProps {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  usernameAvailability: UsernameAvailability;
  firstNameValue: string;
  lastNameValue: string;
  usernameValue: string;
  bioValue: string;
  disabled?: boolean;
}

const USERNAME_STATUS_MAP: Record<UsernameAvailability, KokyuUsernameFieldStatus> = {
  idle: 'idle',
  checking: 'loading',
  available: 'success',
  unavailable: 'error',
  error: 'error',
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

/** Nome, Sobrenome, Username and Bio — the editable half of "Identidade" (the other half is the live preview in `ProfileSummary`). */
export function ProfileIdentityForm({
  control,
  register,
  errors,
  usernameAvailability,
  firstNameValue,
  lastNameValue,
  usernameValue,
  bioValue,
  disabled = false,
}: ProfileIdentityFormProps) {
  const hasMounted = useHasMounted();

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" component="h2">
        Identidade
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <KokyuTextField
          label="Nome"
          autoComplete="given-name"
          disabled={disabled}
          error={Boolean(errors.firstName)}
          helperText={errors.firstName?.message}
          // See the "Sobre você" field below for why this needs an
          // explicit `defaultValue` alongside `register()`.
          defaultValue={firstNameValue}
          {...register('firstName')}
        />
        <KokyuTextField
          label="Sobrenome"
          autoComplete="family-name"
          disabled={disabled}
          error={Boolean(errors.lastName)}
          helperText={errors.lastName?.message}
          defaultValue={lastNameValue}
          {...register('lastName')}
        />
      </Box>

      <KokyuUsernameField
        label="Username"
        autoComplete="username"
        status={USERNAME_STATUS_MAP[usernameAvailability]}
        disabled={disabled}
        error={Boolean(errors.username) || usernameAvailability === 'unavailable'}
        helperText={errors.username?.message ?? usernameHelperText(usernameAvailability)}
        defaultValue={usernameValue}
        {...register('username')}
      />

      <Box>
        {/*
         * `Controller`, not `register()` — MUI's `multiline` TextField
         * renders via `TextareaAutosize`, which never reflects its
         * `value` in the server-rendered HTML the way a plain
         * `<input>` does (verified directly against the raw SSR
         * output: `register()`-only fields correctly ship their
         * `defaultValue`, this `<textarea>` never does, controlled or
         * not). `Controller` alone doesn't close that gap — it only
         * guarantees this component itself never fights RHF over the
         * value. The gap is closed by `disabled={disabled ||
         * !hasMounted}` below: for the one render where the real value
         * hasn't landed in the DOM yet, the field simply can't be
         * typed into, so there's nothing for a fast interaction (an
         * automated test, or a real user on a slow connection) to
         * corrupt.
         */}
        <Controller
          control={control}
          name="bio"
          render={({ field }) => (
            <KokyuTextField
              label="Sobre você"
              placeholder="Conte um pouco sobre você..."
              multiline
              rows={3}
              disabled={disabled || !hasMounted}
              error={Boolean(errors.bio)}
              helperText={errors.bio?.message}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <Typography
          variant="caption"
          component="p"
          sx={(theme) => ({
            textAlign: 'right',
            marginTop: 0.5,
            color: themePalette(theme).kokyu.text.secondary,
          })}
        >
          {bioValue.length}/{profileConfig.bio.maxLength}
        </Typography>
      </Box>
    </Stack>
  );
}
