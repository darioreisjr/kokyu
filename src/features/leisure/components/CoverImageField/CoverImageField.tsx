'use client';

import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { uploadLeisureCoverImage } from '../../services/leisureCoverUploadService';
import { validateCoverImageFile } from '../../utils/validateCoverImageFile';

export interface CoverImageFieldProps {
  value: string | undefined;
  onChange: (url: string) => void;
}

/**
 * Two ways to set a leisure item's cover, matching the spec exactly:
 * paste a link, or upload a file from the computer. Uploading resolves a
 * real URL (the public "leisure-covers" object) and writes it into the
 * same field the link input edits — from the form's point of view
 * there's only ever one `coverImage` string, however it got there.
 */
export function CoverImageField({ value, onChange }: CoverImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset now, not after the async work, so picking the same file twice
    // in a row still fires a change event.
    event.target.value = '';
    if (!file) return;

    setUploadError(null);
    const validation = validateCoverImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadLeisureCoverImage(file);
      onChange(url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Box
        sx={(theme) => ({
          width: 72,
          height: 96,
          flexShrink: 0,
          borderRadius: 1,
          backgroundColor: themePalette(theme).kokyu.background.subtle,
          backgroundImage: value ? `url(${value})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        {!value ? (
          <ImageRoundedIcon
            aria-hidden="true"
            sx={(theme) => ({ fontSize: 28, color: themePalette(theme).kokyu.text.disabled })}
          />
        ) : null}
      </Box>

      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        <KokyuTextField
          label="Link da imagem (opcional)"
          placeholder="https://..."
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={handleFileChange}
          aria-label="Enviar imagem do computador"
        />
        <KokyuButton
          type="button"
          variant="outlined"
          size="small"
          loading={isUploading}
          onClick={() => inputRef.current?.click()}
          sx={{ alignSelf: 'flex-start' }}
        >
          Enviar do computador
        </KokyuButton>
        {uploadError ? (
          <Typography
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.error })}
          >
            {uploadError}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}
