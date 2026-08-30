'use client';

import { useCallback, useEffect, useState } from 'react';

import { getCroppedImageBlob, type PixelCrop } from '../utils/cropImage';
import { validateAvatarFile } from '../utils/validateAvatarFile';

export type PendingAvatarChange =
  { type: 'upload'; blob: Blob; previewUrl: string } | { type: 'remove' };

export interface UseAvatarEditorResult {
  /** What to render right now — the pending change if any, else the original. */
  previewUrl: string | null;
  isDirty: boolean;
  warning: string | null;
  error: string | null;
  /** Set while the crop dialog should be open — the object URL of the just-selected source file. */
  cropSource: string | null;
  pendingChange: PendingAvatarChange | null;
  onFileSelected: (file: File) => Promise<void>;
  onCancelCrop: () => void;
  onConfirmCrop: (pixelCrop: PixelCrop, rotation: number) => Promise<void>;
  onRemove: () => void;
  reset: () => void;
}

/**
 * Owns every object URL this feature creates (the just-selected
 * source image, and the cropped preview) and revokes each one
 * whenever the value that owns it changes *or* the hook unmounts —
 * one cleanup effect per URL-holding piece of state, so a leak can't
 * happen no matter which path (confirm, cancel, remove, discard,
 * unmount) got there. Persisting a pending change is the caller's
 * job (see `useProfileForm`) — this hook only tracks what's staged.
 */
export function useAvatarEditor(originalAvatarUrl: string | null): UseAvatarEditorResult {
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<PendingAvatarChange | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (cropSource) URL.revokeObjectURL(cropSource);
    };
  }, [cropSource]);

  useEffect(() => {
    const url = pendingChange?.type === 'upload' ? pendingChange.previewUrl : null;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [pendingChange]);

  const onFileSelected = useCallback(async (file: File) => {
    setError(null);
    setWarning(null);

    const validation = await validateAvatarFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    if (validation.warning) setWarning(validation.warning);
    setCropSource(URL.createObjectURL(file));
  }, []);

  const onCancelCrop = useCallback(() => setCropSource(null), []);

  const onConfirmCrop = useCallback(
    async (pixelCrop: PixelCrop, rotation: number) => {
      if (!cropSource) return;
      const blob = await getCroppedImageBlob(cropSource, pixelCrop, rotation);
      setCropSource(null);
      setPendingChange({ type: 'upload', blob, previewUrl: URL.createObjectURL(blob) });
    },
    [cropSource],
  );

  const onRemove = useCallback(() => setPendingChange({ type: 'remove' }), []);

  const reset = useCallback(() => {
    setCropSource(null);
    setPendingChange(null);
    setError(null);
    setWarning(null);
  }, []);

  const previewUrl =
    pendingChange?.type === 'upload'
      ? pendingChange.previewUrl
      : pendingChange?.type === 'remove'
        ? null
        : originalAvatarUrl;

  return {
    previewUrl,
    isDirty: pendingChange !== null,
    warning,
    error,
    cropSource,
    pendingChange,
    onFileSelected,
    onCancelCrop,
    onConfirmCrop,
    onRemove,
    reset,
  };
}
