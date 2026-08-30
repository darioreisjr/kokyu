'use client';

import { useEffect, useRef, useState } from 'react';

import { authConfig } from '../constants/authConfig';
import { createAccountService } from '../services/createAccountService';
import type { UsernameAvailability } from '../types/createAccount.types';
import { isUsernameFormatValid } from '../utils/username';

interface ResolvedCheck {
  username: string;
  status: 'available' | 'unavailable' | 'error';
}

/**
 * Debounced (`authConfig.usernameCheckDebounceMs`) mock availability
 * check — never fires on every keystroke. Skips the check entirely
 * while the username doesn't even pass its own format rules yet
 * (asking the service about `"da"` is pointless, it's already
 * invalid), and ignores a response that arrives after a newer
 * request has already superseded it.
 *
 * `originalUsername` is optional and only meaningful for an *editing*
 * context (the profile page) — when the current value matches it,
 * this returns `'unchanged'` without ever touching the debounce or
 * the service, since there's nothing to verify. Create-account never
 * passes it, so its behavior is unaffected.
 *
 * `checking` is never `setState`'d directly — it's derived from
 * "format is valid, but no resolved result exists for *this exact*
 * username yet". The effect only calls `setResult` from inside the
 * debounced async callback, never synchronously in the effect body.
 */
export function useUsernameAvailability(
  username: string,
  originalUsername?: string,
): UsernameAvailability {
  const [result, setResult] = useState<ResolvedCheck | null>(null);
  const latestRequestId = useRef(0);
  const isFormatValid = Boolean(username) && isUsernameFormatValid(username);
  const isUnchanged =
    originalUsername !== undefined &&
    username.trim().toLowerCase() === originalUsername.trim().toLowerCase();

  useEffect(() => {
    if (!isFormatValid || isUnchanged) return;

    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    const timeoutId = setTimeout(() => {
      createAccountService
        .checkUsernameAvailability(username)
        .then((checkResult) => {
          if (latestRequestId.current !== requestId) return;
          setResult({ username, status: checkResult.available ? 'available' : 'unavailable' });
        })
        .catch(() => {
          if (latestRequestId.current !== requestId) return;
          setResult({ username, status: 'error' });
        });
    }, authConfig.usernameCheckDebounceMs);

    return () => clearTimeout(timeoutId);
  }, [username, isFormatValid, isUnchanged]);

  if (isUnchanged) return 'unchanged';
  if (!isFormatValid) return 'idle';
  if (result && result.username === username) return result.status;
  return 'checking';
}
