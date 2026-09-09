import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { CurrentUserProvider } from '@/features/current-user';
import { AuthenticatedShell, SessionCheckError } from '@/features/navigation';
import { sanitizeReturnTo } from '@/features/onboarding/utils/returnTo';
import { getCurrentUserServer } from '@/lib/api/server';

/**
 * Shared by every route under `/app` — the authoritative profile-
 * completion gate, then the authenticated shell (sidebar/drawer +
 * content area) wrapped in `CurrentUserProvider`.
 *
 * `proxy.ts` already redirects a signed-out visitor away from `/app/**`
 * before this ever renders, but that's cheap-and-defensive, not
 * authoritative for *this* gate — it only knows a Supabase session
 * exists, not whether the backend considers this user's profile
 * complete. This Server Component is the one place that calls `/me`
 * and decides: no session → `/login` (defense in depth alongside
 * `proxy.ts`); a session but an incomplete profile → `/perfil/completar`.
 * `redirect()` throws, so nothing below ever renders in the redirect
 * cases — no flash of authenticated content.
 *
 * A backend *failure* (network/DNS, the backend down, a misconfigured
 * `NEXT_PUBLIC_API_URL`, ...) is deliberately NOT a redirect to
 * `/login` — that used to be the behavior here, and it produced a real
 * production incident: `proxy.ts` bounces any *signed-in* visitor
 * straight back off `/login` to `/app`, which would hit this exact
 * same failing check again, forever (`ERR_TOO_MANY_REDIRECTS`,
 * immediately after a real Google/email sign-in — the session is
 * genuine, only the `/me` call itself is failing). Rendering
 * `SessionCheckError` in place instead — no navigation at all — cannot
 * loop, while still never silently granting access to `/app` on an
 * error this gate can't interpret.
 *
 * The resolved `CurrentUser` is handed straight into
 * `CurrentUserProvider` as `initialCurrentUser`, so every client
 * component under `/app` (Header, Sidebar, Home, ...) reads it from
 * `useCurrentUser()` with zero extra fetch/flash on first paint.
 */
export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const result = await getCurrentUserServer();

  if (result.status === 'unauthenticated') {
    redirect('/login');
  }

  if (result.status === 'error') {
    return <SessionCheckError />;
  }

  if (!result.currentUser.profileCompletion.completed) {
    // The path this visitor actually tried to reach (set by `proxy.ts`
    // as `x-pathname`) — carried along so completing onboarding can
    // send them back to it instead of the generic `/app`. `/app`
    // itself needs no `returnTo` (that's already the default), and
    // `sanitizeReturnTo` refuses anything that isn't a real `/app/**`
    // path, so a stray/spoofed header just falls back to no `returnTo`
    // rather than ever producing an unsafe redirect.
    const requestedPath = (await headers()).get('x-pathname');
    const returnTo = requestedPath && requestedPath !== '/app' ? sanitizeReturnTo(requestedPath) : null;
    redirect(returnTo ? `/perfil/completar?returnTo=${encodeURIComponent(returnTo)}` : '/perfil/completar');
  }

  return (
    <CurrentUserProvider initialCurrentUser={result.currentUser}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </CurrentUserProvider>
  );
}
