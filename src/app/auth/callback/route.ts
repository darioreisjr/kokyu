import { NextResponse, type NextRequest } from 'next/server';

import { resolvePostAuthDestinationServer } from '@/features/auth/utils/resolvePostAuthDestination.server';
import { createClient } from '@/lib/supabase/server';

/**
 * Shared PKCE landing target for every Supabase Auth flow that redirects
 * back into the app with a `code` to exchange for a session: Google
 * OAuth (`signInWithOAuth`), password recovery
 * (`resetPasswordForEmail`) and email confirmation alike — see
 * `docs/auth-flows.md` in the backend repo.
 *
 * Where to land afterwards:
 * - `next=/reset-password` (set only by the password-recovery flow) is
 *   honored exactly as-is, bypassing the profile-completion resolver —
 *   the whole point of that link is to let the visitor set a new
 *   password *before* anything else happens; redirecting them to
 *   `/perfil/completar` instead would strand the recovery flow.
 * - Otherwise (OAuth sign-in, email confirmation, or no explicit `next`
 *   at all — "Google e email devem utilizar o mesmo fluxo"),
 *   `resolvePostAuthDestinationServer()` decides: `/perfil/completar`
 *   for an incomplete profile, `/app` otherwise. This is the one
 *   funnel point for every non-recovery entry into the app, so the
 *   onboarding gate can never be bypassed by a flow this route forgot
 *   to check.
 *
 * `next` is never trusted as an absolute/external URL - only a path
 * beginning with `/` is honored, so this can't become an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');
  const explicitNext = rawNext && rawNext.startsWith('/') ? rawNext : null;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination =
        explicitNext === '/reset-password'
          ? explicitNext
          : (explicitNext ?? (await resolvePostAuthDestinationServer('/app')));
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  const url = new URL('/login', origin);
  url.searchParams.set('error', 'auth_callback_failed');
  return NextResponse.redirect(url);
}
