import { createClient } from '@/lib/supabase/client';

import { ApiError } from './errors';
import { apiRequest, type ApiRequestInit } from './request';
import type { CurrentUser } from './types';

export type CurrentUserClientResult =
  | { status: 'authenticated'; currentUser: CurrentUser }
  | { status: 'unauthenticated' }
  | { status: 'error'; error: unknown };

export interface ClientRequestInit extends Omit<ApiRequestInit, 'accessToken'> {
  /**
   * Set by the onboarding screen's own calls (`/profile/complete`, the
   * avatar endpoints while incomplete) so a `PROFILE_SETUP_REQUIRED`
   * response never triggers the redirect-to-self loop `apiFetchClient`
   * otherwise performs automatically for every other call site.
   */
  suppressProfileSetupRedirect?: boolean;
}

/**
 * Generic authenticated backend call from a Client Component — attaches
 * the current browser session's access token automatically, and
 * centralizes `PROFILE_SETUP_REQUIRED` handling so individual call
 * sites (Header, Sidebar, any future feature) never need to special-
 * case it themselves: on that response, this navigates to the
 * `redirectTo` the backend sent (falling back to `/perfil/completar`)
 * instead of letting the caller render whatever it was about to render.
 * A hard `window.location` navigation, not `router.push` — this module
 * has no React Router context to call into, being usable from plain
 * event handlers and non-component code alike.
 */
export async function apiFetchClient<T>(
  path: string,
  options: ClientRequestInit = {},
): Promise<T> {
  const { suppressProfileSetupRedirect, ...init } = options;
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  try {
    return await apiRequest<T>(path, { ...init, accessToken: session?.access_token ?? null });
  } catch (error) {
    if (
      !suppressProfileSetupRedirect &&
      error instanceof ApiError &&
      error.code === 'PROFILE_SETUP_REQUIRED' &&
      typeof window !== 'undefined'
    ) {
      const target = error.redirectTo || '/perfil/completar';
      // Guards the redirect loop: if we're already on the target
      // (e.g. some other in-flight call on the onboarding page forgot
      // to suppress), don't re-navigate to the page we're already on.
      if (window.location.pathname !== target) {
        window.location.assign(target);
      }
    }
    throw error;
  }
}

/** Client-side equivalent of `getCurrentUserServer()` — used by `CurrentUserProvider.refreshCurrentUser()` after a mutation, and by `resolvePostAuthDestinationClient()`. */
export async function getCurrentUserClient(): Promise<CurrentUserClientResult> {
  const supabase = createClient();
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
