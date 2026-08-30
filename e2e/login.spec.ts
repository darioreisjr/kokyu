import { expect, test } from '@playwright/test';

test.describe('Login flow', () => {
  test('redirects the root route to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('shows the login form with its main fields and actions', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continuar com Google/ })).toBeVisible();
  });

  test('shows validation messages when submitted empty', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Informe seu e-mail')).toBeVisible();
    await expect(page.getByText('Informe sua senha')).toBeVisible();
  });

  test('validates an invalid email and recovers once it is corrected', async ({ page }) => {
    await page.goto('/login');

    const email = page.getByLabel('E-mail');
    await email.fill('email-invalido');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Informe um e-mail válido')).toBeVisible();

    await email.fill('usuario@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('super-secreta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Informe um e-mail válido')).toHaveCount(0);
  });

  test('submits the form once email and password are valid and enters the app', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.getByLabel('E-mail').fill('usuario@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('super-secreta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole('heading', { name: 'Respiração' })).toBeVisible();
  });

  test('toggles password visibility', async ({ page }) => {
    await page.goto('/login');

    const password = page.getByLabel('Senha', { exact: true });
    await password.fill('super-secreta');
    await expect(password).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(password).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('exposes the Google sign-in button as an accessible control', async ({ page }) => {
    await page.goto('/login');

    const googleButton = page.getByRole('button', { name: /Continuar com Google/ });
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });
});
