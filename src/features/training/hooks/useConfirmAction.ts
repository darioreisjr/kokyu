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
  request: (request: ConfirmActionRequest) => void;
  confirm: () => void;
  cancel: () => void;
}

/**
 * Every destructive Treinamento action (arquivar rotina, descartar sessão, excluir histórico) calls
 * through here instead of its own dialog — respects Settings → "Confirmar ações importantes" once,
 * centrally. Same pattern as `features/goals`/`features/leisure`/`features/nutrition`, each with
 * their own copy since features never import each other's internals.
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
