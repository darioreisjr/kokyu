'use client';

import { useCallback, useState } from 'react';
import { usePreferences } from '@/features/settings';

export interface PendingAction {
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function useConfirmAction() {
  const { preferences } = usePreferences();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const confirm = useCallback(
    (action: PendingAction) => {
      if (!preferences.general.confirmImportantActions) {
        action.onConfirm();
        return;
      }
      setPendingAction(action);
    },
    [preferences.general.confirmImportantActions],
  );

  const handleConfirm = useCallback(async () => {
    if (pendingAction) {
      await pendingAction.onConfirm();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleCancel = useCallback(() => {
    setPendingAction(null);
  }, []);

  return {
    confirm,
    pendingAction,
    handleConfirm,
    handleCancel,
    isOpen: pendingAction !== null,
  };
}
