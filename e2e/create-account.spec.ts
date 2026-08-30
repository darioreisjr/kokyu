import { expect, type Locator, type Page, test } from '@playwright/test';

async function fillBirthDate(page: Page, day: string, month: string, year: string) {
  const group = page.getByRole('group', { name: 'Data de nascimento' });
  await group.locator('[aria-label="Day"]').click();
  await page.keyboard.type(day + month + year);
}

async function fillValidProfile(page: Page, username: string) {
  await page.getByLabel('Nome', { exact: true }).fill('Dario');
  await page.getByLabel('Sobrenome').fill('Reis');
  await page.getByLabel('Username').fill(username);
  await fillBirthDate(page, '28', '08', '2000');
  await page.getByLabel('Senha', { exact: true }).fill('Abcdefg1!');
  await page.getByLabel('Confirmar senha').fill('Abcdefg1!');
}

function nYearsAgo(years: number): { day: string; month: string; year: string } {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
}

test.describe('Create account flow', () => {
  test('navigates from login to create-account and shows the form', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL(/\/create-account$/);
    // The login → create-account crossfade takes ~480ms and briefly
    // renders both pages at once; wait for it to settle rather than
    // asserting on a mid-animation frame (see `AuthTransition`).
    await page.getByRole('heading', { name: 'Crie sua conta' }).first().waitFor();
    await page.waitForTimeout(700);

    await expect(page.getByRole('heading', { name: 'Crie sua conta' })).toBeVisible();
    await expect(page.getByLabel('Nome', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Sobrenome')).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByRole('group', { name: 'Data de nascimento' })).toBeVisible();
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirmar senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
  });

  test('shows an error for every required field when submitted empty', async ({ page }) => {
    await page.goto('/create-account');

    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('Informe seu nome')).toBeVisible();
    await expect(page.getByText('Informe seu sobrenome')).toBeVisible();
    await expect(page.getByText('O username deve ter entre 3 e 30 caracteres')).toBeVisible();
    await expect(page.getByText('Informe sua data de nascimento')).toBeVisible();
    await expect(page.getByText('Confirme sua senha')).toBeVisible();
  });

  test('rejects someone younger than 18', async ({ page }) => {
    await page.goto('/create-account');

    const { day, month, year } = nYearsAgo(17);
    await fillBirthDate(page, day, month, year);
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(
      page.getByText('Você precisa ter pelo menos 18 anos para criar uma conta'),
    ).toBeVisible();
  });

  test('shows the live password requirements checklist for an invalid password', async ({
    page,
  }) => {
    await page.goto('/create-account');

    const password: Locator = page.getByLabel('Senha', { exact: true });
    await password.fill('abcdefgh');

    const checklist = page.getByRole('list', { name: 'Requisitos de senha' });
    await expect(checklist).toBeVisible();
    await expect(checklist.getByText('Uma letra maiúscula')).toBeVisible();
    await expect(checklist.getByText('Um número')).toBeVisible();
    await expect(checklist.getByText('Um caractere especial')).toBeVisible();

    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByText('A senha não atende aos requisitos mínimos')).toBeVisible();
  });

  test('creates an account with valid data and shows the success feedback', async ({ page }) => {
    await page.goto('/create-account');

    await fillValidProfile(page, `e2e_user_${Date.now()}`);

    await expect(page.getByText('Username disponível')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('Conta criada com sucesso')).toBeVisible();
    await expect(page.getByText('Seu perfil inicial está pronto.')).toBeVisible();
  });

  test('navigates back to login from the "Entrar" link', async ({ page }) => {
    await page.goto('/create-account');

    await page.getByRole('link', { name: 'Entrar' }).click();

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
  test.describe(`Create-account page — ${name} (${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    test('keeps the form visible, the CTA reachable and no horizontal overflow', async ({
      page,
    }) => {
      await page.goto('/create-account');

      await expect(page.getByLabel('Nome', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Username')).toBeVisible();

      const submit = page.getByRole('button', { name: 'Criar conta' });
      await expect(submit).toBeVisible();
      await expect(submit).toBeEnabled();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('navigation to and from login works', async ({ page }) => {
      await page.goto('/create-account');
      await page.getByRole('link', { name: 'Entrar' }).click();
      await expect(page).toHaveURL(/\/login$/);
    });
  });
}
