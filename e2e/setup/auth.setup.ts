import { expect, test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import {
  AUTH_STATE_PATH,
  COMPLETE_PROFILE_USER,
  LOGOUT_USER,
  loginAsCompleteUser,
} from '../fixtures/auth';

const SUPABASE_URL = process.env.E2E_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.E2E_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;
const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000/api/v1';

/**
 * Makes sure the e2e users exist, confirmed and with a complete profile.
 * Only runs with a service-role key (CI and a local stack from
 * `supabase start` provide one); otherwise the users are assumed to exist.
 * Idempotent: an existing user is reused and a completed profile is left as-is.
 */
async function ensureUser(
  user: { email: string; password: string },
  username: string,
): Promise<void> {
  if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) return;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: existing } = await admin.auth.admin.listUsers();
  if (!existing.users.some((candidate) => candidate.email === user.email)) {
    const { error } = await admin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });
    if (error) throw error;
  }

  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: signIn, error: signInError } = await anon.auth.signInWithPassword(user);
  if (signInError) throw signInError;
  const response = await fetch(`${API_URL}/profile/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signIn.session.access_token}`,
    },
    body: JSON.stringify({
      firstName: 'Usuário',
      lastName: 'Teste',
      username,
      birthDate: '1990-01-01',
    }),
  });
  // 201 on first completion; 409 when the profile was already completed.
  expect([201, 409]).toContain(response.status);
  // Only the local signIn above: never revoke the session other specs share.
  await anon.auth.signOut({ scope: 'local' });
}

/**
 * Logs in once as the seeded complete-profile user and saves the session,
 * so every signed-in spec starts authenticated (projects depend on this
 * one and use `storageState: AUTH_STATE_PATH`). Specs that must start
 * signed out opt out with `test.use(SIGNED_OUT)`.
 */
setup('authenticate as the complete-profile user', async ({ page }) => {
  await ensureUser(COMPLETE_PROFILE_USER, 'usuario_e2e');
  await ensureUser(LOGOUT_USER, 'logout_e2e');
  await loginAsCompleteUser(page);
  await expect(page).toHaveURL(/\/app/);
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
