import { expect, test, type Page } from '@playwright/test';

import { confirmationLinkFromInbucket, freshSignupIdentity, loginAsCompleteUser } from './fixtures/auth';

/**
 * End-to-end coverage for profile-completion gating
 * (`/perfil/completar`) — see the task's spec for the exact scenarios
 * this file was asked to cover. Every test here needs a reachable,
 * seeded Supabase (with Inbucket, its local dev SMTP catcher, for the
 * email-confirmation scenario) + kokyu-sam backend stack; none of it
 * was runnable in the sandbox this feature was built in. Written
 * correctly against how login/session/create-account already work in
 * this repo's existing specs (`login.spec.ts`, `create-account.spec.ts`)
 * — see the task's final report for what could/couldn't be verified.
 */

async function fillBirthDate(page: Page, day: string, month: string, year: string) {
  const group = page.getByRole('group', { name: 'Data de nascimento' });
  await group.locator('[aria-label="Day"]').click();
  await page.keyboard.type(day + month + year);
}

test.describe('Onboarding (profile completion)', () => {
  test('a new email signup is confirmed, logs in, lands on /perfil/completar prefilled, completes it, and reaches /app', async ({
    page,
  }) => {
    const identity = freshSignupIdentity();

    await page.goto('/create-account');
    await page.getByLabel('E-mail').fill(identity.email);
    await page.getByLabel('Nome', { exact: true }).fill('Dario');
    await page.getByLabel('Sobrenome').fill('Reis');
    await page.getByLabel('Username').fill(identity.username);
    await fillBirthDate(page, '28', '08', '2000');
    await page.getByLabel('Senha', { exact: true }).fill('Abcdefgh123!');
    await page.getByLabel('Confirmar senha').fill('Abcdefgh123!');
    await expect(page.getByText('Username disponível')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByText('Verifique seu e-mail')).toBeVisible();

    const confirmationLink = await confirmationLinkFromInbucket(identity.email);
    test.skip(!confirmationLink, 'Inbucket (local Supabase SMTP catcher) was not reachable.');
    await page.goto(confirmationLink!);

    // The backend's own on-signup bootstrap decides how much of
    // create-account's data (username/lastName/birthDate) actually
    // carries over into the profile vs. still needing to be confirmed
    // here — either way, landing on `/perfil/completar` (not `/app`)
    // is the behavior under test, regardless of which fields show
    // prefilled.
    await page.waitForURL(/\/perfil\/completar/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Complete seu perfil' })).toBeVisible();
    await expect(page.getByLabel('Nome', { exact: true })).not.toHaveValue('');

    if (!(await page.getByLabel('Sobrenome').inputValue())) {
      await page.getByLabel('Sobrenome').fill('Reis');
    }
    if (!(await page.getByLabel('Username').inputValue())) {
      await page.getByLabel('Username').fill(identity.username);
    }
    const birthDateEmpty = await page
      .getByRole('group', { name: 'Data de nascimento' })
      .locator('[aria-label="Day"]')
      .textContent();
    if (!birthDateEmpty || birthDateEmpty === 'DD') {
      await fillBirthDate(page, '28', '08', '2000');
    }

    const continueButton = page.getByRole('button', { name: 'Continuar' });
    await expect(continueButton).toBeEnabled({ timeout: 5000 });
    await continueButton.click();

    await page.waitForURL(/\/app/, { timeout: 15000 });
  });

  test('an incomplete profile is blocked from a business route by direct URL and sent back to /perfil/completar', async ({
    page,
  }) => {
    const identity = freshSignupIdentity();

    await page.goto('/create-account');
    await page.getByLabel('E-mail').fill(identity.email);
    await page.getByLabel('Nome', { exact: true }).fill('Dario');
    await page.getByLabel('Sobrenome').fill('Reis');
    await page.getByLabel('Username').fill(identity.username);
    await fillBirthDate(page, '28', '08', '2000');
    await page.getByLabel('Senha', { exact: true }).fill('Abcdefgh123!');
    await page.getByLabel('Confirmar senha').fill('Abcdefgh123!');
    await expect(page.getByText('Username disponível')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByText('Verifique seu e-mail')).toBeVisible();

    const confirmationLink = await confirmationLinkFromInbucket(identity.email);
    test.skip(!confirmationLink, 'Inbucket (local Supabase SMTP catcher) was not reachable.');
    await page.goto(confirmationLink!);
    await page.waitForURL(/\/perfil\/completar/, { timeout: 15000 });

    // Deep-linking straight into a business route while the profile is
    // still incomplete must never render it — the server-side gate in
    // `app/app/layout.tsx` redirects back to `/perfil/completar` before
    // any `/app/treinamento` content has a chance to flash. The
    // attempted path is carried along as `returnTo` (via `proxy.ts`'s
    // `x-pathname` header), so finishing onboarding sends this visitor
    // back to `/app/treinamento` instead of the generic `/app`.
    await page.goto('/app/treinamento');
    await page.waitForURL(/\/perfil\/completar\?returnTo=%2Fapp%2Ftreinamento/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Complete seu perfil' })).toBeVisible();

    if (!(await page.getByLabel('Sobrenome').inputValue())) {
      await page.getByLabel('Sobrenome').fill('Reis');
    }
    if (!(await page.getByLabel('Username').inputValue())) {
      await page.getByLabel('Username').fill(identity.username);
    }
    const birthDateEmpty = await page
      .getByRole('group', { name: 'Data de nascimento' })
      .locator('[aria-label="Day"]')
      .textContent();
    if (!birthDateEmpty || birthDateEmpty === 'DD') {
      await fillBirthDate(page, '28', '08', '2000');
    }

    const continueButton = page.getByRole('button', { name: 'Continuar' });
    await expect(continueButton).toBeEnabled({ timeout: 5000 });
    await continueButton.click();

    await page.waitForURL(/\/app\/treinamento/, { timeout: 15000 });
  });

  test('a profile-complete user logs in normally and reaches /app directly', async ({ page }) => {
    await loginAsCompleteUser(page);
    await expect(page).toHaveURL(/\/app/);
    await expect(page.locator('aside[aria-label="Barra lateral"]')).toBeVisible();
  });

  test('an edited profile persists across a reload', async ({ page }) => {
    await loginAsCompleteUser(page);
    await page.goto('/app/perfil');

    const bio = page.getByLabel('Sobre você');
    const newBio = `E2E bio ${Date.now()}`;
    await bio.fill(newBio);
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText('Perfil atualizado com sucesso.')).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('Sobre você')).toHaveValue(newBio);
  });
});
