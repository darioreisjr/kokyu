/**
 * Same fail-fast rationale as `lib/supabase/env.ts` — see that file's
 * doc comment for why each variable needs its own literal
 * `process.env.NEXT_PUBLIC_X` access rather than a computed one.
 *
 * `NEXT_PUBLIC_API_URL` is read (not just a server-only secret) because
 * some calls to the kokyu-sam backend happen directly from the browser
 * (e.g. username availability while typing, the direct-to-Supabase-
 * Storage avatar upload flow) — not every call goes through a Server
 * Component/Route Handler.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const apiUrl = (): string =>
  requireEnv('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL);
