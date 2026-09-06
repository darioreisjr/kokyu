import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * Shared PKCE landing target for every Supabase Auth flow that redirects
 * back into the app with a `code` to exchange for a session: Google
 * OAuth (`signInWithOAuth`) and password recovery
 * (`resetPasswordForEmail`) alike — see `docs/auth-flows.md` in the
 * backend repo. Which screen to land on afterwards is carried in the
 * `next` query param baked into each flow's own `redirectTo` (defaults
 * to the authenticated app for OAuth); recovery links set `next=/reset-password`.
 *
 * `next` is never trusted as an absolute/external URL - only a path
 * beginning with `/` is honored, so this can't become an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/app';
  const next = rawNext.startsWith('/') ? rawNext : '/app';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const url = new URL('/login', origin);
  url.searchParams.set('error', 'auth_callback_failed');
  return NextResponse.redirect(url);
}
