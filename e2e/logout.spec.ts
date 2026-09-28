import { expect, test } from '@playwright/test';

import { LOGOUT_USER, loginAs, SIGNED_OUT } from './fixtures/auth';

// Its own user and session: the app signs out globally (every session of
// the user), so logging out as the shared e2e user would break every other
// spec running at the same time.
test.use(SIGNED_OUT);

test.describe('Logout', () => {
  test('logs out from the desktop sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, LOGOUT_USER);

    await page.getByRole('button', { name: 'Sair' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/app');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logs out from the mobile drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, LOGOUT_USER);

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByRole('button', { name: 'Sair' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
