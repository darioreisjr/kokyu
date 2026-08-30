'use client';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface SnackbarContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

interface QueuedMessage {
  message: string;
  severity: 'success' | 'error';
}

/**
 * App-wide toast/feedback surface — a single `Snackbar` + `Alert`
 * (already used inline for form errors, e.g. `LoginForm`) mounted once
 * here instead of every feature building its own. `Alert`'s
 * `severity` colors already resolve through the theme
 * (`createKokyuPalette`: `success.main`/`error.main` ← Tanjiro/Hinokami
 * feedback tokens), so no color is hardcoded here.
 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [queued, setQueued] = useState<QueuedMessage | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback((message: string, severity: QueuedMessage['severity']) => {
    setQueued({ message, severity });
    setOpen(true);
  }, []);

  const value = useMemo<SnackbarContextValue>(
    () => ({
      showSuccess: (message: string) => show(message, 'success'),
      showError: (message: string) => show(message, 'error'),
    }),
    [show],
  );

  function handleClose(_event: unknown, reason?: string) {
    if (reason === 'clickaway') return;
    setOpen(false);
  }

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {queued ? (
          <Alert severity={queued.severity} onClose={() => setOpen(false)} variant="filled">
            {queued.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
