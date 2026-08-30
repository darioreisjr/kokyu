import { expect, test } from '@playwright/test';

test.describe('Forgot password flow', () => {
  test('navigates from login to the recovery screen', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Esqueci minha senha' }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    // The login <-> forgot-password crossfade briefly renders both
    // pages at once; wait for it to settle rather than asserting on a
    // mid-animation frame (see `AuthTransition`).
    await page.getByRole('heading', { name: 'Recupere sua senha' }).first().waitFor();
    await page.waitForTimeout(700);

    await expect(page.getByRole('heading', { name: 'Recupere sua senha' })).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar instruções' })).toBeVisible();
  });

  test('shows a validation error when submitted empty', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByRole('button', { name: 'Enviar instruções' }).click();

    await expect(page.getByText('Informe seu e-mail')).toBeVisible();
  });

  test('shows a validation error for an invalid email', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel('E-mail').fill('email-invalido');
    await page.getByRole('button', { name: 'Enviar instruções' }).click();

    await expect(page.getByText('Informe um e-mail válido')).toBeVisible();
  });

  test('submits a valid email and shows the neutral confirmation state', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel('E-mail').fill('usuario@example.com');
    await page.getByRole('button', { name: 'Enviar instruções' }).click();

    await expect(page.getByRole('heading', { name: 'Verifique seu e-mail' })).toBeVisible();
    await expect(
      page.getByText(
        'Se existir uma conta associada a este endereço, você receberá as instruções para redefinir sua senha.',
      ),
    ).toBeVisible();
    await expect(page.getByText('usuario@example.com')).toBeVisible();

    // The interface must never reveal whether the account actually exists.
    for (const forbidden of ['não encontrado', 'não cadastrado', 'conta inexistente']) {
      await expect(page.getByText(forbidden, { exact: false })).toHaveCount(0);
    }
  });

  test('"Enviar novamente" starts a cooldown that counts down', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel('E-mail').fill('usuario@example.com');
    await page.getByRole('button', { name: 'Enviar instruções' }).click();
    await page.getByRole('heading', { name: 'Verifique seu e-mail' }).waitFor();

    const resendButton = page.getByRole('button', { name: /Enviar novamente/ });
    await expect(resendButton).toBeDisabled();
    await expect(resendButton).toHaveText('Enviar novamente em 30s');

    // The countdown actually ticks, rather than staying frozen at 30.
    await expect(resendButton).not.toHaveText('Enviar novamente em 30s', { timeout: 3000 });
  });

  test('navigates back to login from "Voltar para entrar"', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByRole('link', { name: 'Voltar para entrar' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' }).first()).toBeVisible();
  });
});

const viewports = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1440, height: 1000 },
} as const;

for (const [name, size] of Object.entries(viewports)) {
  test.describe(`Forgot-password page — ${name} (${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    test('keeps the form visible, the CTA reachable and no horizontal overflow', async ({
      page,
    }) => {
      await page.goto('/forgot-password');

      await expect(page.getByLabel('E-mail')).toBeVisible();

      const submit = page.getByRole('button', { name: 'Enviar instruções' });
      await expect(submit).toBeVisible();
      await expect(submit).toBeEnabled();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('navigation to and from login works', async ({ page }) => {
      await page.goto('/forgot-password');
      await page.getByRole('link', { name: 'Voltar para entrar' }).click();
      await expect(page).toHaveURL(/\/login$/);
    });
  });
}
