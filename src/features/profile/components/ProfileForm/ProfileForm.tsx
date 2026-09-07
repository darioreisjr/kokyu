'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import { useWatch } from 'react-hook-form';

import { KokyuButton } from '@/design-system/components';
import { useEffectiveReducedMotion } from '@/design-system/providers/MotionPreferenceProvider';
import { duration, motionEasing, msToSeconds } from '@/design-system/tokens/primitives/motion';

import { useProfileForm } from '../../hooks/useProfileForm';
import type { UserProfile } from '../../types/profile.types';
import { ProfileAccountInfo } from '../ProfileAccountInfo/ProfileAccountInfo';
import { ProfileIdentityForm } from '../ProfileIdentityForm/ProfileIdentityForm';
import { ProfilePersonalInfoForm } from '../ProfilePersonalInfoForm/ProfilePersonalInfoForm';
import { ProfileSummary } from '../ProfileSummary/ProfileSummary';

export interface ProfileFormProps {
  profile: UserProfile;
}

/**
 * The interactive half of the page once a profile is loaded — a two
 * column layout from `lg` up (the preview needs a fixed-ish width; the
 * form gets the rest, deliberately not a 50/50 split), single column
 * below that. `ProfilePage` owns the async load; this only ever
 * receives an already-loaded `profile`.
 */
export function ProfileForm({ profile }: ProfileFormProps) {
  const {
    form: {
      register,
      control,
      formState: { errors, isValid },
    },
    avatar,
    usernameAvailability,
    isDirty,
    isSaving,
    saveError,
    onSubmit,
    onDiscard,
  } = useProfileForm(profile);

  const shouldReduceMotion = useEffectiveReducedMotion();
  const firstName = useWatch({ control, name: 'firstName' });
  const lastName = useWatch({ control, name: 'lastName' });
  const username = useWatch({ control, name: 'username' });
  const bio = useWatch({ control, name: 'bio' });

  const canSave =
    isDirty &&
    isValid &&
    usernameAvailability !== 'unavailable' &&
    usernameAvailability !== 'checking' &&
    !isSaving;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: msToSeconds(duration.slow), ease: motionEasing.standard }}
    >
      <Box
        component="form"
        noValidate
        onSubmit={onSubmit}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 320px) 1fr' },
          gap: { xs: 5, lg: 6 },
          alignItems: 'start',
        }}
      >
        <ProfileSummary
          firstName={firstName ?? ''}
          lastName={lastName ?? ''}
          username={username ?? ''}
          bio={bio ?? ''}
          avatar={avatar}
          disabled={isSaving}
        />

        <Stack spacing={4}>
          <ProfileIdentityForm
            control={control}
            register={register}
            errors={errors}
            usernameAvailability={usernameAvailability}
            firstNameValue={firstName ?? ''}
            lastNameValue={lastName ?? ''}
            usernameValue={username ?? ''}
            bioValue={bio ?? ''}
            disabled={isSaving}
          />
          <Divider />
          <ProfilePersonalInfoForm
            control={control}
            register={register}
            errors={errors}
            disabled={isSaving}
          />
          <Divider />
          <ProfileAccountInfo email={profile.email} />

          {saveError ? <Alert severity="error">{saveError}</Alert> : null}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            <KokyuButton
              type="button"
              variant="text"
              size="large"
              onClick={onDiscard}
              disabled={!isDirty || isSaving}
              sx={{ order: { xs: 2, sm: 1 } }}
            >
              Descartar alterações
            </KokyuButton>
            <KokyuButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSaving}
              loadingLabel="Salvando"
              disabled={!canSave}
              sx={{ order: { xs: 1, sm: 2 } }}
            >
              Salvar alterações
            </KokyuButton>
          </Stack>
        </Stack>
      </Box>
    </motion.div>
  );
}
