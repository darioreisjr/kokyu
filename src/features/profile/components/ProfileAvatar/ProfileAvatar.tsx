'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, type ChangeEvent } from 'react';

import { KokyuAvatar, KokyuButton, type KokyuAvatarSize } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { duration, motionEasing, msToSeconds } from '@/design-system/tokens/primitives/motion';

import { getInitials } from '../../utils/getInitials';

/** Standard "visually hidden, still announced by screen readers" recipe (see `PasswordRequirements`). */
const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

export interface ProfileAvatarProps {
  previewUrl: string | null;
  firstName: string;
  lastName: string;
  error?: string | null;
  warning?: string | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
  size?: KokyuAvatarSize;
}

/**
 * Presentational avatar + "Alterar foto"/"Remover foto" — no crop
 * logic of its own (`ProfileSummary` owns `AvatarCropDialog` and wires
 * `onFileSelected` through to it). A short scale+opacity entrance
 * plays whenever the preview actually changes, keyed on the URL
 * itself so switching between two real photos still animates.
 */
export function ProfileAvatar({
  previewUrl,
  firstName,
  lastName,
  error,
  warning,
  onFileSelected,
  onRemove,
  disabled = false,
  size = 'lg',
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = getInitials(firstName, lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so selecting the exact same file again still fires onChange.
    event.target.value = '';
    if (file) onFileSelected(file);
  }

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={previewUrl ?? 'fallback'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: msToSeconds(duration.normal), ease: motionEasing.standard }}
        >
          <KokyuAvatar
            src={previewUrl}
            alt={previewUrl ? `Foto de perfil de ${fullName}` : undefined}
            initials={initials}
            size={size}
          />
        </motion.div>
      </AnimatePresence>

      {error ? (
        <Typography
          variant="caption"
          role="alert"
          sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.error })}
        >
          {error}
        </Typography>
      ) : null}
      {warning ? (
        <Typography
          variant="caption"
          sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.warning })}
        >
          {warning}
        </Typography>
      ) : null}

      <Stack direction="row" spacing={1}>
        <KokyuButton
          type="button"
          variant="outlined"
          size="small"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Alterar foto
        </KokyuButton>
        {previewUrl ? (
          <KokyuButton
            type="button"
            variant="text"
            size="small"
            onClick={onRemove}
            disabled={disabled}
          >
            Remover foto
          </KokyuButton>
        ) : null}
      </Stack>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        aria-label="Foto de perfil"
        style={visuallyHidden}
      />
    </Stack>
  );
}
