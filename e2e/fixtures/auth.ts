import type { Page } from '@playwright/test';

/** Where `setup/auth.setup.ts` saves the signed-in session (git-ignored). */
export const AUTH_STATE_PATH = 'e2e/.auth/user.json';

/** `test.use(SIGNED_OUT)` for a spec that must start without a session (login, signup, ...). */
export const SIGNED_OUT = { storageState: { cookies: [], origins: [] } };

/**
 * Shared e2e auth fixtures. There is no Playwright `storageState`
 * project wired up yet (see the note at the bottom) — every helper
 * here drives the real UI instead, exactly like `login.spec.ts`
 * already does for its "submits the form... and enters the app" test.
 * All of this requires a reachable, seeded Supabase + kokyu-sam backend
 * stack (`supabase start` in the backend repo, plus this repo's own
 * `pnpm build && next start`) — it was not runnable in the sandbox
 * this feature was built in. See the top-level task report for exactly
 * what could/couldn't be verified.
 */

/**
 * A pre-seeded user whose profile is already complete — reused as-is
 * from `login.spec.ts`'s existing "submits the form once email and
 * password are valid and enters the app" test, which already assumes
 * this exact user exists and authenticates successfully. If that
 * assumption ever changes (a different seeded user, or none), update
 * both this file and `login.spec.ts` together — they must stay in
 * sync, there is intentionally only one definition of "the" e2e user.
 */
export const COMPLETE_PROFILE_USER = {
  email: process.env.E2E_COMPLETE_USER_EMAIL ?? 'usuario@example.com',
  password: process.env.E2E_COMPLETE_USER_PASSWORD ?? 'super-secreta',
};

/**
 * A second complete-profile user, only for the logout tests: the app signs
 * out with Supabase's default *global* scope, which revokes every session of
 * that user - logging out as COMPLETE_PROFILE_USER would kill the session
 * every other spec shares (saved by setup/auth.setup.ts) mid-run.
 */
export const LOGOUT_USER = {
  email: process.env.E2E_LOGOUT_USER_EMAIL ?? 'logout-e2e@example.com',
  password: process.env.E2E_LOGOUT_USER_PASSWORD ?? 'super-secreta',
};

/** Logs in via the real login form and waits for the post-login redirect to resolve. */
export async function loginAs(
  page: Page,
  user: { email: string; password: string },
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(user.email);
  await page.getByLabel('Senha', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/app/, { timeout: 15000 });
}

/** Logs in as `COMPLETE_PROFILE_USER` via the real login form. */
export async function loginAsCompleteUser(page: Page): Promise<void> {
  await loginAs(page, COMPLETE_PROFILE_USER);
}

/** A syntactically valid, virtually-never-colliding email/username pair for a fresh signup in a given test run. */
export function freshSignupIdentity() {
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    email: `e2e_${stamp}@example.com`,
    username: `e2e_${stamp}`,
  };
}

const INBUCKET_BASE_URL = process.env.E2E_INBUCKET_URL ?? 'http://127.0.0.1:54324';

/**
 * Best-effort: reads the latest email Supabase's local dev stack sent
 * to `email` via Inbucket (the SMTP catcher `supabase start` runs by
 * default at `127.0.0.1:54324`) and extracts the confirmation link.
 * Returns `null` — never throws — when Inbucket isn't reachable or no
 * matching message shows up in time, so a caller can skip the assertion
 * cleanly instead of failing with a confusing network error. This is
 * the "test mechanism" the onboarding spec's full-signup scenario needs
 * to confirm a brand new account without a human clicking an email.
 */
export async function confirmationLinkFromInbucket(
  email: string,
  timeoutMs = 15000,
): Promise<string | null> {
  const mailbox = email.split('@')[0];
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const listResponse = await fetch(`${INBUCKET_BASE_URL}/api/v1/mailbox/${mailbox}`);
      if (listResponse.ok) {
        const messages: Array<{ id: string }> = await listResponse.json();
        const latest = messages.at(-1);
        if (latest) {
          const messageResponse = await fetch(
            `${INBUCKET_BASE_URL}/api/v1/mailbox/${mailbox}/${latest.id}`,
          );
          if (messageResponse.ok) {
            const message: { body: { text?: string; html?: string } } =
              await messageResponse.json();
            const body = message.body.html ?? message.body.text ?? '';
            const match = body.match(/https?:\/\/[^\s"'<>]+\/auth\/callback[^\s"'<>]*/);
            if (match) return match[0];
          }
        }
      }
    } catch {
      // Inbucket unreachable — fall through to the retry/timeout below.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

/**
 * NOT wired up as a Playwright `storageState`/setup project — every
 * spec that needs an authenticated session logs in via the real UI
 * each time (`loginAsCompleteUser`) instead. A shared, once-per-run
 * `storageState` (Playwright's documented pattern: a `setup` project
 * that authenticates once and every other project depends on it,
 * `use: { storageState }`) would be materially faster across the full
 * suite, but wiring it in touches `playwright.config.ts` project-wide —
 * every existing spec (including `login.spec.ts`/`create-account.spec.ts`,
 * which need to start signed-OUT) would need auditing against the new
 * default. That's a larger, riskier change than this task's scope, and
 * not something verifiable without the live stack this repo's sandbox
 * didn't have — left as a documented follow-up rather than attempted
 * half-verified.
 */
