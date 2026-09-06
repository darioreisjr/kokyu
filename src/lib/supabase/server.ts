import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { supabaseAnonKey, supabaseUrl } from './env';

/**
 * Supabase client for Server Components, Server Functions and Route
 * Handlers. `cookies()` is async in this Next.js version (15+) — see
 * `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md`.
 *
 * `setAll` can throw when called during a Server Component render
 * (cookies can only be mutated from a Server Function or Route Handler) —
 * that's swallowed on purpose: `proxy.ts` already refreshes the session
 * and writes the resulting cookies on every request, so a render-time
 * `setAll` no-op here doesn't lose anything.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // See doc comment above.
        }
      },
    },
  });
}
