'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { useLoadProfile } from '../../hooks/useLoadProfile';
import { ProfileForm } from '../ProfileForm/ProfileForm';
import { ProfilePageSkeleton } from './ProfilePageSkeleton';

/**
 * Owns the async load boundary — header, then a `Skeleton` while
 * pending, the form once ready, or a plain error state. Kept separate
 * from `ProfileForm` so the interactive form never needs to know
 * anything about fetching.
 */
export function ProfilePage() {
  const { status, profile } = useLoadProfile();

  return (
    <Stack spacing={4}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Perfil
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Gerencie sua identidade e suas informações no Kokyu.
        </Typography>
      </Stack>

      {status === 'loading' ? <ProfilePageSkeleton /> : null}
      {status === 'error' ? (
        <Alert severity="error">Não foi possível carregar seu perfil agora. Tente novamente.</Alert>
      ) : null}
      {status === 'ready' && profile ? <ProfileForm profile={profile} /> : null}
    </Stack>
  );
}
