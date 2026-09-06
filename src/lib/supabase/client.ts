import { createBrowserClient } from '@supabase/ssr';

import { supabaseAnonKey, supabaseUrl } from './env';

/**
 * Supabase client for use in Client Components. Session cookies are
 * managed by `@supabase/ssr` itself (readable by the server client and
 * `proxy.ts` too) — never store the session in `localStorage` under a
 * hand-rolled key.
 *
 * A fresh client is cheap to construct (no network call happens until a
 * request is made), so callers create one where needed rather than
 * reaching for a singleton/context.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
