'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import {
  KokyuTextField,
  KokyuUsernameField,
  type KokyuUsernameFieldStatus,
} from '@/design-system/components';
import { authText, type UsernameAvailability } from '@/features/auth';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { profileConfig } from '../../constants/profileConfig';
import type { ProfileFormValues } from '../../schemas/profileSchema';

export interface ProfileIdentityFormProps {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  usernameAvailability: UsernameAvailability;
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
  register,
  errors,
  usernameAvailability,
  bioValue,
  disabled = false,
}: ProfileIdentityFormProps) {
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
          {...register('firstName')}
        />
        <KokyuTextField
          label="Sobrenome"
          autoComplete="family-name"
          disabled={disabled}
          error={Boolean(errors.lastName)}
          helperText={errors.lastName?.message}
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
        {...register('username')}
      />

      <Box>
        <KokyuTextField
          label="Sobre você"
          placeholder="Conte um pouco sobre você..."
          multiline
          rows={3}
          disabled={disabled}
          error={Boolean(errors.bio)}
          helperText={errors.bio?.message}
          {...register('bio')}
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
