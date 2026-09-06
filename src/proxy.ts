import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { supabaseAnonKey, supabaseUrl } from './lib/supabase/env';

const AUTH_ROUTES = ['/login', '/create-account', '/forgot-password', '/reset-password'];
const PROTECTED_PREFIX = '/app';

function isUnderPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Refreshes the Supabase session cookie on every request (so a soon-to-
 * expire access token never reaches a Server Component with a stale
 * session) and enforces the two route-protection rules `authService`'s
 * mocked version had no way to express: signed-out visitors get bounced
 * off `/app/**`, and already-signed-in visitors get bounced off the
 * sign-in/sign-up screens instead of seeing them again.
 *
 * `/reset-password` is deliberately excluded from that second rule: by
 * the time a visitor reaches it, `/auth/callback` has already exchanged
 * their recovery link for a real session (updateUser requires one) - to
 * "not-signed-in" this proxy that visitor otherwise IS signed in, but
 * redirecting them away from the very form they clicked the email link
 * for would break password recovery entirely.
 *
 * IMPORTANT (per Supabase's own guidance): nothing runs between
 * `createServerClient` and `supabase.auth.getUser()` below - inserting
 * logic there is a common way to end up with users randomly signed out.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = user ? PROTECTED_PREFIX : '/login';
    return NextResponse.redirect(url);
  }

  const isProtectedRoute = isUnderPrefix(pathname, PROTECTED_PREFIX);
  const isAuthRoute = AUTH_ROUTES.some((route) => isUnderPrefix(pathname, route));

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute && pathname !== '/reset-password') {
    const url = request.nextUrl.clone();
    url.pathname = PROTECTED_PREFIX;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets, image optimization and metadata
    // files — see docs/proxy.md's own recommended negative matcher.
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
