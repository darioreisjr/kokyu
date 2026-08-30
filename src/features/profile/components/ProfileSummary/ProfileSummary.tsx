'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import type { UseAvatarEditorResult } from '../../hooks/useAvatarEditor';
import { AvatarCropDialog } from '../AvatarCropDialog/AvatarCropDialog';
import { ProfileAvatar } from '../ProfileAvatar/ProfileAvatar';

export interface ProfileSummaryProps {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  avatar: UseAvatarEditorResult;
  disabled?: boolean;
}

/**
 * The live preview column: avatar (with its own change/remove/crop
 * flow) plus name, `@username` and bio, all read straight from the
 * form's current values — it updates as the user types, exactly like
 * a real profile preview should.
 */
export function ProfileSummary({
  firstName,
  lastName,
  username,
  bio,
  avatar,
  disabled = false,
}: ProfileSummaryProps) {
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <ProfileAvatar
        previewUrl={avatar.previewUrl}
        firstName={firstName}
        lastName={lastName}
        error={avatar.error}
        warning={avatar.warning}
        onFileSelected={avatar.onFileSelected}
        onRemove={avatar.onRemove}
        disabled={disabled}
      />

      <Stack spacing={0.5}>
        <Typography variant="h3" component="p">
          {fullName || 'Seu nome'}
        </Typography>
        {username ? (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            @{username}
          </Typography>
        ) : null}
      </Stack>

      {bio ? (
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {bio}
        </Typography>
      ) : null}

      <AvatarCropDialog
        open={Boolean(avatar.cropSource)}
        imageSrc={avatar.cropSource}
        onCancel={avatar.onCancelCrop}
        onConfirm={avatar.onConfirmCrop}
      />
    </Stack>
  );
}
