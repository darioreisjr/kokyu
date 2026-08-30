'use client';

import { useState } from 'react';

import { usePreferences } from '@/features/settings/providers/PreferencesProvider';

export interface ConfirmActionRequest {
  title: string;
  description: string;
  /** Defaults to "Confirmar" — pass something like "Excluir" for a destructive action's own wording. */
  confirmLabel?: string;
  onConfirm: () => void;
}

export interface UseConfirmActionResult {
  pending: ConfirmActionRequest | null;
  /** Every destructive action in this feature calls through here instead of its own dialog — respects Settings → "Confirmar ações importantes" once, centrally. */
  request: (request: ConfirmActionRequest) => void;
  confirm: () => void;
  cancel: () => void;
}

/**
 * When "Confirmar ações importantes" is off, `request()` runs
 * `onConfirm` immediately — no dialog, no double confirmation on top
 * of a preference that already says "skip this." Never a second,
 * feature-local copy of that preference.
 */
export function useConfirmAction(): UseConfirmActionResult {
  const { preferences } = usePreferences();
  const [pending, setPending] = useState<ConfirmActionRequest | null>(null);

  function request(nextRequest: ConfirmActionRequest) {
    if (!preferences.general.confirmImportantActions) {
      nextRequest.onConfirm();
      return;
    }
    setPending(nextRequest);
  }

  function confirm() {
    pending?.onConfirm();
    setPending(null);
  }

  function cancel() {
    setPending(null);
  }

  return { pending, request, confirm, cancel };
}
