'use client';

import { useEffect } from 'react';

import { useSnackbar } from '@/design-system/providers/SnackbarProvider';

import { ApiError, friendlyErrorMessage } from './errors';

export const UNHANDLED_API_ERROR_FALLBACK = 'Algo deu errado. Tente novamente em instantes.';

/**
 * Safety net: an API call whose rejection no screen handled still tells
 * the user something went wrong (in pt-BR), instead of failing silently
 * with only an "Uncaught (in promise)" in the console. Screens should
 * still catch their own errors - this only covers the ones that slip.
 * Non-API rejections are left alone, so programming errors stay visible.
 */
export function UnhandledApiErrorListener() {
  const { showError } = useSnackbar();

  useEffect(() => {
    function handleRejection(event: PromiseRejectionEvent) {
      if (!(event.reason instanceof ApiError)) return;
      event.preventDefault();
      console.warn('Unhandled API error', event.reason);
      showError(friendlyErrorMessage(event.reason, UNHANDLED_API_ERROR_FALLBACK));
    }
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, [showError]);

  return null;
}
