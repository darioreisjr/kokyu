'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import type { PixelCrop } from '../../utils/cropImage';

export interface AvatarCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onConfirm: (pixelCrop: PixelCrop, rotation: number) => void;
}

/**
 * The crop step between selecting a file and it becoming the staged
 * avatar. Only mounts `CropperPanel` (and so only ever holds
 * crop/zoom/rotation state) while there's an image to crop —
 * `key={imageSrc}` remounts it fresh for a new source instead of an
 * effect resetting state, so there's nothing to reset in the first
 * place (React's recommended pattern over "adjust state when a prop
 * changes", and it sidesteps the React Compiler's
 * `set-state-in-effect` rule entirely).
 */
export function AvatarCropDialog({ open, imageSrc, onCancel, onConfirm }: AvatarCropDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="avatar-crop-title"
    >
      <DialogTitle id="avatar-crop-title">Ajustar foto</DialogTitle>
      {imageSrc ? (
        <CropperPanel
          key={imageSrc}
          imageSrc={imageSrc}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      ) : null}
    </Dialog>
  );
}

interface CropperPanelProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (pixelCrop: PixelCrop, rotation: number) => void;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ROTATION_MIN = 0;
const ROTATION_MAX = 360;

/** `cropShape="round"` mirrors how the result is actually displayed (a circular avatar). */
function CropperPanel({ imageSrc, onCancel, onConfirm }: CropperPanelProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  function handleConfirm() {
    if (croppedAreaPixels) onConfirm(croppedAreaPixels, rotation);
  }

  return (
    <>
      <DialogContent>
        <Box
          sx={(theme) => ({
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            backgroundColor: themePalette(theme).kokyu.background.subtle,
            borderRadius: 1,
            overflow: 'hidden',
          })}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={(_croppedArea: Area, pixels: Area) => setCroppedAreaPixels(pixels)}
          />
        </Box>

        <Stack spacing={2.5} sx={{ marginTop: 3 }}>
          <Box>
            <Typography id="avatar-zoom-label" variant="labelMedium" gutterBottom>
              Zoom
            </Typography>
            <Slider
              aria-labelledby="avatar-zoom-label"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={0.1}
              value={zoom}
              onChange={(_event, value) => setZoom(value as number)}
            />
          </Box>
          <Box>
            <Typography id="avatar-rotation-label" variant="labelMedium" gutterBottom>
              Rotação
            </Typography>
            <Slider
              aria-labelledby="avatar-rotation-label"
              min={ROTATION_MIN}
              max={ROTATION_MAX}
              step={1}
              value={rotation}
              onChange={(_event, value) => setRotation(value as number)}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton type="button" variant="text" onClick={onCancel}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          type="button"
          variant="contained"
          onClick={handleConfirm}
          disabled={!croppedAreaPixels}
        >
          Usar esta foto
        </KokyuButton>
      </DialogActions>
    </>
  );
}
