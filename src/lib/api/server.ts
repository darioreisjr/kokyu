import { createClient } from '@/lib/supabase/server';

import { ApiError } from './errors';
import { apiRequest, type ApiRequestInit } from './request';
import type { CurrentUser } from './types';

export type CurrentUserServerResult =
  | { status: 'authenticated'; currentUser: CurrentUser }
  | { status: 'unauthenticated' }
  /** A non-401 failure talking to the backend — the caller must never treat this as "show /app anyway". */
  | { status: 'error'; error: unknown };

/**
 * Server Component/Route Handler helper — reads the Supabase session
 * cookie (already refreshed by `proxy.ts` on every request) and, if one
 * exists, calls the backend's `GET /me` with it. `getSession()` (not
 * `getUser()`) is deliberate here: the access token is only ever handed
 * to *our own* backend, which independently verifies the JWT — there's
 * no need to pay for a second round trip to Supabase just to read a
 * token back out of an already-trusted cookie jar.
 */
export async function getCurrentUserServer(): Promise<CurrentUserServerResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { status: 'unauthenticated' };
  }

  try {
    const currentUser = await apiRequest<CurrentUser>('/me', { accessToken: session.access_token });
    return { status: 'authenticated', currentUser };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: 'unauthenticated' };
    }
    return { status: 'error', error };
  }
}

/**
 * Generic authenticated backend call from a Server Component/Route
 * Handler — attaches the current session's access token automatically.
 * Prefer `getCurrentUserServer()` for `/me` itself; this is for
 * everything else a server-side caller needs (none yet, but kept
 * alongside it rather than duplicated per call site later).
 */
export async function apiFetchServer<T>(
  path: string,
  init: Omit<ApiRequestInit, 'accessToken'> = {},
): Promise<T> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return apiRequest<T>(path, { ...init, accessToken: session?.access_token ?? null });
}
