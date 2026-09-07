'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useWatch } from 'react-hook-form';

import {
  KokyuButton,
  KokyuDateField,
  KokyuTextField,
  KokyuUsernameField,
  type KokyuUsernameFieldStatus,
} from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { authText, calculateAge, type UsernameAvailability } from '@/features/auth';
import { AvatarCropDialog, ProfileAvatar, countries, profileConfig, useHasMounted } from '@/features/profile';
import type { CurrentUser } from '@/lib/api/types';

import { onboardingText } from '../../constants/onboardingText';
import { useOnboardingForm } from '../../hooks/useOnboardingForm';

const text = onboardingText;

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

export interface OnboardingFormProps {
  /** Server-fetched — `app/perfil/completar/page.tsx` already confirmed this profile is incomplete before rendering this. */
  currentUser: CurrentUser;
  /** Where to land after completing onboarding — the deep link a profile-incomplete visitor originally tried to reach, already validated by `sanitizeReturnTo`. Omitted/`null` (the common case) falls back to `/app`. */
  returnTo?: string | null;
}

/**
 * The `/perfil/completar` form: required fields first (Nome, Sobrenome,
 * Username, Data de nascimento — prefilled from `currentUser.profile`
 * when the backend already has them, from signup metadata or the
 * Google identity, but still requiring an explicit submit), then an
 * optional section (avatar, bio, país/estado/cidade) that never blocks
 * "Continuar". Structurally close to `ProfileForm`, deliberately
 * simpler: a single column, no live-preview side panel — this is a
 * one-time setup step, not the full profile-editing screen.
 */
export function OnboardingForm({ currentUser, returnTo = null }: OnboardingFormProps) {
  const {
    form: {
      register,
      control,
      formState: { errors, isValid },
    },
    avatar,
    usernameAvailability,
    isSubmitting,
    submitError,
    onSubmit,
  } = useOnboardingForm(currentUser, returnTo);

  const hasMounted = useHasMounted();

  const firstName = useWatch({ control, name: 'firstName' }) ?? '';
  const lastName = useWatch({ control, name: 'lastName' }) ?? '';
  const username = useWatch({ control, name: 'username' }) ?? '';
  const bio = useWatch({ control, name: 'bio' }) ?? '';
  const region = useWatch({ control, name: 'region' }) ?? '';
  const city = useWatch({ control, name: 'city' }) ?? '';
  const birthDate = useWatch({ control, name: 'birthDate' });
  const age = birthDate ? calculateAge(birthDate) : null;

  const canSubmit =
    isValid &&
    usernameAvailability !== 'unavailable' &&
    usernameAvailability !== 'checking' &&
    !isSubmitting;

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={4}>
      <Stack spacing={2.5}>
        <Typography variant="h4" component="h2">
          {text.requiredSectionTitle}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
          <KokyuTextField
            label={text.firstNameLabel}
            autoComplete="given-name"
            disabled={isSubmitting}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName?.message}
            // `register()` is ref-based and never contributes to the
            // server-rendered HTML — SSR always ships an empty field,
            // and the real (possibly bootstrap-prefilled) value only
            // lands once hydration's ref callback fires a moment
            // later. `defaultValue` renders it immediately instead;
            // for an uncontrolled field React only applies it once, at
            // mount, so it never fights `register()`'s own updates as
            // the user types.
            defaultValue={firstName}
            {...register('firstName')}
          />
          <KokyuTextField
            label={text.lastNameLabel}
            autoComplete="family-name"
            disabled={isSubmitting}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName?.message}
            defaultValue={lastName}
            {...register('lastName')}
          />
        </Box>

        <KokyuUsernameField
          label={text.usernameLabel}
          autoComplete="username"
          status={USERNAME_STATUS_MAP[usernameAvailability]}
          disabled={isSubmitting}
          error={Boolean(errors.username) || usernameAvailability === 'unavailable'}
          helperText={errors.username?.message ?? usernameHelperText(usernameAvailability)}
          defaultValue={username}
          {...register('username')}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
          <Controller
            control={control}
            name="birthDate"
            render={({ field, fieldState }) => (
              <KokyuDateField
                label={text.birthDateLabel}
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                maxDate={new Date()}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                disabled={isSubmitting}
              />
            )}
          />
          <KokyuTextField
            label="Idade"
            value={age !== null ? `${age} anos` : ''}
            disabled
            helperText="Calculada a partir da data de nascimento"
            slotProps={{ input: { readOnly: true } }}
          />
        </Box>
      </Stack>

      <Divider />

      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h2">
            {text.optionalSectionTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {text.optionalSectionDescription}
          </Typography>
        </Stack>

        <ProfileAvatar
          previewUrl={avatar.previewUrl}
          firstName={firstName}
          lastName={lastName}
          error={avatar.error}
          warning={avatar.warning}
          onFileSelected={avatar.onFileSelected}
          onRemove={avatar.onRemove}
          disabled={isSubmitting}
          size="md"
        />
        <AvatarCropDialog
          open={Boolean(avatar.cropSource)}
          imageSrc={avatar.cropSource}
          onCancel={avatar.onCancelCrop}
          onConfirm={avatar.onConfirmCrop}
        />

        <Box>
          {/*
           * `Controller`, not `register()`, plus `disabled={... ||
           * !hasMounted}` — see `ProfileIdentityForm`'s bio field for
           * the full reasoning: MUI's `multiline` TextField
           * (`TextareaAutosize`) never reflects its value in the
           * server-rendered HTML at all, controlled or not, so the
           * field is disabled for the one render where that hasn't
           * landed yet — nothing left for a fast interaction to
           * corrupt.
           */}
          <Controller
            control={control}
            name="bio"
            render={({ field }) => (
              <KokyuTextField
                label={text.bioLabel}
                placeholder={text.bioPlaceholder}
                multiline
                rows={3}
                disabled={isSubmitting || !hasMounted}
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
            {bio.length}/{profileConfig.bio.maxLength}
          </Typography>
        </Box>

        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <KokyuTextField
              select
              label={text.countryLabel}
              disabled={isSubmitting}
              error={Boolean(errors.country)}
              helperText={errors.country?.message}
              {...field}
            >
              <MenuItem value="">
                <em>Não informar</em>
              </MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.label}
                </MenuItem>
              ))}
            </KokyuTextField>
          )}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
          <KokyuTextField
            label={text.regionLabel}
            disabled={isSubmitting}
            error={Boolean(errors.region)}
            helperText={errors.region?.message}
            defaultValue={region}
            {...register('region')}
          />
          <KokyuTextField
            label={text.cityLabel}
            disabled={isSubmitting}
            error={Boolean(errors.city)}
            helperText={errors.city?.message}
            defaultValue={city}
            {...register('city')}
          />
        </Box>
      </Stack>

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <KokyuButton
        type="submit"
        size="large"
        fullWidth
        loading={isSubmitting}
        loadingLabel={text.submitLoading}
        disabled={!canSubmit}
      >
        {text.submit}
      </KokyuButton>
    </Stack>
  );
}
