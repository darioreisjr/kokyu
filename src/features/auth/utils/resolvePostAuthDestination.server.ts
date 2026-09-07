import { getCurrentUserServer } from '@/lib/api/server';

import {
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
  resolveDestinationForCurrentUser,
} from './resolvePostAuthDestination';

/**
 * Server-side entry point — `app/auth/callback/route.ts`. There is no
 * `usePreferences()` on the server (preferences live in `localStorage`),
 * so the fallback here is always the generic authenticated home; a
 * complete-profile user's "resume last page"/"home page" preference
 * still applies moments later, the next time `useLoginForm` runs the
 * client resolver — this server-side hop only affects the very first
 * redirect right after the OAuth/email-confirmation/password-recovery
 * code exchange.
 *
 * Split into its own file (rather than living next to
 * `resolvePostAuthDestinationClient`) purely so importing it — which
 * pulls in `@/lib/supabase/server` → `next/headers` — can never happen
 * by accident through `features/auth/index.ts`, the barrel this
 * feature's Client Components import from. Import this one directly:
 * `@/features/auth/utils/resolvePostAuthDestination.server`.
 */
export async function resolvePostAuthDestinationServer(
  fallbackDestination: string = DEFAULT_AUTHENTICATED_PATH,
): Promise<string> {
  const result = await getCurrentUserServer();
  if (result.status !== 'authenticated') return LOGIN_PATH;
  return resolveDestinationForCurrentUser(result.currentUser, fallbackDestination);
}
