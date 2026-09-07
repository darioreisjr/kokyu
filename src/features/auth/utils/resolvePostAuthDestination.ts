import { getCurrentUserClient } from '@/lib/api/client';
import type { CurrentUser } from '@/lib/api/types';

export const ONBOARDING_PATH = '/perfil/completar';
export const DEFAULT_AUTHENTICATED_PATH = '/app';
export const LOGIN_PATH = '/login';

/**
 * The one and only place "where does a signed-in user land" branches.
 * Every entry point — email/password login, Google, the OAuth/password-
 * recovery callback route — goes through this (via the client wrapper
 * below, or `resolvePostAuthDestinationServer` in
 * `resolvePostAuthDestination.server.ts`) instead of re-deriving the
 * rule, so a profile-incomplete user can never end up anywhere but
 * `/perfil/completar` regardless of which flow authenticated them.
 *
 * Deliberately synchronous and side-effect free: it only decides, given
 * an already-resolved `CurrentUser`, where to go. Never call this with
 * a locally-computed "is the profile complete" guess — always pass what
 * `/me` (or a mutation's response) actually said.
 */
export function resolveDestinationForCurrentUser(
  currentUser: CurrentUser,
  fallbackDestination: string = DEFAULT_AUTHENTICATED_PATH,
): string {
  return currentUser.profileCompletion.completed ? fallbackDestination : ONBOARDING_PATH;
}

/**
 * Client-side entry point — `useLoginForm`'s email/password and Google
 * success handlers. `fallbackDestination` is expected to be the
 * existing preference-based destination (`resumeLastPage`/
 * `lastVisitedPage`/`homePage`, computed by the caller via
 * `usePreferences()`) so wiring this in never regresses that UX for an
 * already-complete profile — it only adds the "still incomplete" branch
 * on top of it.
 *
 * Kept in this file (rather than the `.server.ts` sibling) specifically
 * so it only ever imports `@/lib/api/client` — never `@/lib/supabase/
 * server`/`next/headers` — and stays safe for `features/auth/index.ts`
 * (a barrel Client Components import) to re-export.
 */
export async function resolvePostAuthDestinationClient(
  fallbackDestination: string = DEFAULT_AUTHENTICATED_PATH,
): Promise<string> {
  const result = await getCurrentUserClient();
  if (result.status !== 'authenticated') return LOGIN_PATH;
  return resolveDestinationForCurrentUser(result.currentUser, fallbackDestination);
}
