'use client';

import { useEffect, useState } from 'react';

export type NotificationPermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

/**
 * Reads the real Web Notifications permission — never requests it on
 * mount. `requestPermission` only ever runs from an explicit user
 * action (Settings → Notificações → toggling "Push" on), matching the
 * platform's own expectation and avoiding the auto-prompt browsers
 * increasingly suppress or penalize anyway.
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermissionState>('unsupported');

  useEffect(() => {
    queueMicrotask(() => {
      if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
      setPermission(Notification.permission);
    });
  }, []);

  async function requestPermission(): Promise<NotificationPermissionState> {
    if (typeof Notification === 'undefined') return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }

  return { permission, requestPermission };
}
