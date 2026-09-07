import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

import { freshSignupIdentity, loginAsCompleteUser } from './fixtures/auth';

const testImage = path.resolve(__dirname, 'fixtures/test-avatar.png');

async function fillBirthDate(page: Page, day: string, month: string, year: string) {
  const group = page.getByRole('group', { name: 'Data de nascimento' });
  await group.locator('[aria-label="Day"]').click();
  await page.keyboard.type(day + month + year);
}

/**
 * `/app/perfil` now requires a real, authenticated, profile-complete
 * session (`app/app/layout.tsx`'s server-side gate) — it can no longer
 * be reached by navigating straight there against mocked data, the way
 * this file did before real auth/profile-completion gating existed.
 * Every test logs in first via `loginAsCompleteUser` (see
 * `fixtures/auth.ts`) — requires a reachable, seeded Supabase +
 * kokyu-sam backend stack; not runnable in the sandbox this feature was
 * built in (see the task's final report for what could/couldn't be
 * verified here).
 *
 * The seeded user's actual `firstName`/`lastName`/`username`/`email`
 * are backend data this frontend doesn't control, so — unlike the old
 * mocked-data version of this file — assertions below read the current
 * values from the page at runtime instead of hardcoding
 * 'Dario'/'Reis'/'darioreis'/'dario@email.com'.
 */
test.describe('Profile page', () => {
  // These tests all sign in as the same seeded `COMPLETE_PROFILE_USER`
  // and mutate its real, persisted profile (name, username, avatar) —
  // running them in parallel workers (this project's default
  // `fullyParallel: true`) races them against each other over shared
  // backend state, producing exactly the kind of flakiness this file
  // hit in practice (a field briefly empty mid-edit, "discard" seeing
  // another test's unsaved change). Serial keeps them safely ordered.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsCompleteUser(page);
    await page.goto('/app/perfil');
  });

  test('loads with populated identity fields — avatar, name, username, email', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();

    const firstName = await page.getByLabel('Nome', { exact: true }).inputValue();
    const lastName = await page.getByLabel('Sobrenome').inputValue();
    const username = await page.getByLabel('Username').inputValue();
    const email = await page.getByLabel('E-mail').inputValue();

    expect(firstName.length).toBeGreaterThan(0);
    expect(lastName.length).toBeGreaterThan(0);
    expect(username.length).toBeGreaterThan(0);
    expect(email).toContain('@');

    // Scoped to `main`, not the whole page — the sidebar's own identity
    // row (`AuthenticatedShell` → `KokyuAppShell`, reading the same
    // `CurrentUserContext`) legitimately shows this same name too.
    await expect(page.getByRole('main').getByText(`${firstName} ${lastName}`)).toBeVisible();
    await expect(page.getByText(`@${username}`)).toBeVisible();
  });

  test('edits the name, saves, and shows the success feedback', async ({ page }) => {
    const originalFirstName = await page.getByLabel('Nome', { exact: true }).inputValue();
    const lastName = await page.getByLabel('Sobrenome').inputValue();
    const firstName = page.getByLabel('Nome', { exact: true });
    await firstName.fill(`${originalFirstName} Editado`);

    const saveButton = page.getByRole('button', { name: 'Salvar alterações' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(page.getByText('Perfil atualizado com sucesso.')).toBeVisible();
    await expect(saveButton).toBeDisabled();
    // The live preview reflects the saved value too.
    await expect(page.getByText(`${originalFirstName} Editado ${lastName}`)).toBeVisible();
  });

  test('changes the username, checks availability, and saves', async ({ page }) => {
    const username = page.getByLabel('Username');
    await username.fill(`e2e_${Date.now()}`);

    await expect(page.getByText('Username disponível')).toBeVisible({ timeout: 5000 });

    const saveButton = page.getByRole('button', { name: 'Salvar alterações' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(page.getByText('Perfil atualizado com sucesso.')).toBeVisible();
  });

  test('reports an unavailable username and blocks saving', async ({ page, browser }) => {
    // Seeds a genuinely taken username via a real, throwaway signup in
    // a fully separate browser context (not just a new tab — a new tab
    // in `page`'s own context shares its cookies, so `/create-account`
    // would immediately redirect to `/app` for an already-signed-in
    // visitor) — self-contained, no hardcoded username and no direct
    // backend/DB access needed. The seed account's email is
    // deliberately never confirmed: `handle_new_user` populates
    // `profiles.username` as soon as the row is inserted, on signup,
    // regardless of confirmation state, which is all this needs.
    const seedIdentity = freshSignupIdentity();
    const seedContext = await browser.newContext();
    const seedPage = await seedContext.newPage();
    await seedPage.goto('/create-account');
    await seedPage.getByLabel('E-mail').fill(seedIdentity.email);
    await seedPage.getByLabel('Nome', { exact: true }).fill('Seed');
    await seedPage.getByLabel('Sobrenome').fill('User');
    await seedPage.getByLabel('Username').fill(seedIdentity.username);
    await fillBirthDate(seedPage, '28', '08', '2000');
    await seedPage.getByLabel('Senha', { exact: true }).fill('Abcdefgh123!');
    await seedPage.getByLabel('Confirmar senha').fill('Abcdefgh123!');
    await expect(seedPage.getByText('Username disponível')).toBeVisible({ timeout: 5000 });
    await seedPage.getByRole('button', { name: 'Criar conta' }).click();
    await expect(seedPage.getByText('Verifique seu e-mail')).toBeVisible();
    await seedContext.close();

    const username = page.getByLabel('Username');
    await username.fill(seedIdentity.username);

    await expect(page.getByText('Este username já está em uso')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  test('rejects a birth date that makes the user younger than 18', async ({ page }) => {
    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
    const day = String(seventeenYearsAgo.getDate()).padStart(2, '0');
    const month = String(seventeenYearsAgo.getMonth() + 1).padStart(2, '0');
    const year = seventeenYearsAgo.getFullYear();

    const group = page.getByRole('group', { name: 'Data de nascimento' });
    await group.locator('[aria-label="Day"]').click();
    await page.keyboard.type(`${day}${month}${year}`);
    await page.keyboard.press('Tab');

    await expect(page.getByText('Você precisa ter pelo menos 18 anos.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  test('selects, crops and confirms an avatar, updating the preview', async ({ page }) => {
    const firstName = await page.getByLabel('Nome', { exact: true }).inputValue();
    const lastName = await page.getByLabel('Sobrenome').inputValue();

    await page.getByLabel('Foto de perfil').setInputFiles(testImage);

    const dialog = page.getByRole('dialog', { name: 'Ajustar foto' });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(500);

    // Zoom is a usable, keyboard-accessible essential control.
    const zoomSlider = page.getByRole('slider', { name: 'Zoom' });
    await zoomSlider.focus();
    await page.keyboard.press('ArrowRight');

    await page.getByRole('button', { name: 'Usar esta foto' }).click();
    await expect(dialog).not.toBeVisible();

    // The cropped result shows up immediately as the avatar preview.
    await expect(
      page.getByRole('img', { name: `Foto de perfil de ${firstName} ${lastName}` }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remover foto' })).toBeVisible();

    const saveButton = page.getByRole('button', { name: 'Salvar alterações' });
    await expect(saveButton).toBeEnabled();
  });

  test('discards changes back to the originally loaded values', async ({ page }) => {
    const originalFirstName = await page.getByLabel('Nome', { exact: true }).inputValue();
    const firstName = page.getByLabel('Nome', { exact: true });
    await firstName.fill(`${originalFirstName} Editado`);
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();

    await page.getByRole('button', { name: 'Descartar alterações' }).click();

    await expect(firstName).toHaveValue(originalFirstName);
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  test('cancels the crop dialog without changing the avatar', async ({ page }) => {
    await page.getByLabel('Foto de perfil').setInputFiles(testImage);
    const dialog = page.getByRole('dialog', { name: 'Ajustar foto' });
    await expect(dialog).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  test('removes an existing avatar back to initials', async ({ page }) => {
    await page.getByLabel('Foto de perfil').setInputFiles(testImage);
    await expect(page.getByRole('dialog', { name: 'Ajustar foto' })).toBeVisible();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Usar esta foto' }).click();
    await expect(page.getByRole('button', { name: 'Remover foto' })).toBeVisible();

    await page.getByRole('button', { name: 'Remover foto' }).click();

    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();
  });
});

const viewports = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1440, height: 1000 },
} as const;

for (const [name, size] of Object.entries(viewports)) {
  test.describe(`Profile page — ${name} (${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    test.beforeEach(async ({ page }) => {
      await loginAsCompleteUser(page);
      await page.goto('/app/perfil');
    });

    test('keeps the form usable with no horizontal overflow', async ({ page }) => {
      await expect(page.getByLabel('Nome', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('the crop dialog stays usable', async ({ page }) => {
      await page.getByLabel('Foto de perfil').setInputFiles(testImage);
      const dialog = page.getByRole('dialog', { name: 'Ajustar foto' });
      await expect(dialog).toBeVisible();

      await expect(page.getByRole('button', { name: 'Usar esta foto' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('the app shell navigation is still reachable', async ({ page }) => {
      if (name === 'mobile') {
        await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
      } else {
        await expect(page.locator('aside[aria-label="Barra lateral"]')).toBeVisible();
      }
    });
  });
}
