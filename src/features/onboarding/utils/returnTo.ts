/**
 * Validates a `returnTo` query value before it's ever used in a
 * redirect/navigation — the same "only a same-origin internal path is
 * honored" rule `auth/callback/route.ts` already applies to its own
 * `next` param, narrowed further to `/app/**` since that's the only
 * place completing onboarding should ever send someone back to.
 * Rejects anything that isn't a real internal path (protocol-relative
 * `//evil.com`, `javascript:`, a bare `app` with no leading slash, ...)
 * so this can never become an open redirect.
 */
export function sanitizeReturnTo(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  if (value !== '/app' && !value.startsWith('/app/')) return null;
  return value;
}
