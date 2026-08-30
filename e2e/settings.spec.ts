import { expect, test } from '@playwright/test';

test.describe('Settings — Aparência', () => {
  test.use({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });

  test('switches theme to dark for real and persists it across a reload', async ({ page }) => {
    await page.goto('/app/configuracoes?section=aparencia');

    await expect(page.getByRole('heading', { name: 'Aparência', level: 2 })).toBeVisible();
    // `ThemeRegistry`'s `InitColorSchemeScript` uses `attribute="data"`,
    // which MUI resolves to a boolean `data-{scheme}` presence
    // attribute (`data-dark` / `data-light`) — not a valued
    // `data-mui-color-scheme="dark"` attribute. First paint is
    // Kokyu's dark-first default; `ThemeModeSync` then resolves
    // "Sistema" against this test's emulated `light` OS preference —
    // fast enough that the transient dark-first frame isn't something
    // worth asserting on, only the settled result.
    await expect(page.locator('html')).not.toHaveAttribute('data-dark');

    await page.getByRole('radio', { name: 'Escuro' }).check();
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');
    await expect(page.getByRole('radio', { name: 'Escuro' })).toBeChecked();
  });

  test('changing "Estilo de respiração" changes the actual primary color token and persists', async ({
    page,
  }) => {
    await page.goto('/app/configuracoes?section=aparencia');

    const readPrimary = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--mui-palette-primary-main'),
      );

    const before = await readPrimary();
    await page.getByRole('radio', { name: 'Mizu' }).check();
    const after = await readPrimary();
    expect(after).not.toBe(before);

    await page.reload();
    await expect(page.getByRole('radio', { name: 'Mizu' })).toBeChecked();
    const afterReload = await readPrimary();
    expect(afterReload).toBe(after);
  });
});

test.describe('Settings — Navegação', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('setting the sidebar to "Recolhido" keeps it collapsed on other pages', async ({ page }) => {
    await page.goto('/app/configuracoes?section=navegacao');
    await expect(page.getByRole('heading', { name: 'Navegação', level: 2 })).toBeVisible();

    await page.getByLabel('Menu lateral').click();
    await page.getByRole('option', { name: 'Recolhido' }).click();

    await page.goto('/app');
    await expect(page.getByRole('button', { name: 'Expandir menu' })).toBeVisible();
    await expect(
      page.locator('aside[aria-label="Barra lateral"]').getByText('Respiração'),
    ).not.toBeVisible();
  });
});

test.describe('Settings — Geral', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('"Página inicial" set to Missões sends a fresh login there', async ({ page }) => {
    await page.goto('/app/configuracoes?section=geral');
    await expect(page.getByRole('heading', { name: 'Geral', level: 2 })).toBeVisible();

    await page.getByLabel('Página inicial').click();
    await page.getByRole('option', { name: 'Missões' }).click();

    await page.goto('/login');
    await page.getByLabel('E-mail').fill('usuario@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('super-secreta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/app\/missoes$/);
  });
});

test.describe('Settings — Rotina', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('changing "Início do dia" persists across a reload', async ({ page }) => {
    await page.goto('/app/configuracoes?section=rotina');
    await expect(page.getByRole('heading', { name: 'Rotina', level: 2 })).toBeVisible();

    const startField = page.getByLabel('Início do dia');
    await startField.fill('07:30');
    await startField.blur();

    await page.reload();
    await expect(page.getByLabel('Início do dia')).toHaveValue('07:30');
  });
});

test.describe('Settings — Notificações', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('disabling the master toggle disables the channel switches', async ({ page }) => {
    await page.goto('/app/configuracoes?section=notificacoes');
    await expect(page.getByRole('heading', { name: 'Notificações', level: 2 })).toBeVisible();

    await expect(page.getByRole('switch', { name: 'Notificações no aplicativo' })).toBeEnabled();

    await page.getByRole('switch', { name: 'Notificações', exact: true }).click();

    await expect(page.getByRole('switch', { name: 'Notificações no aplicativo' })).toBeDisabled();
  });
});

test.describe('Settings — Restaurar', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('restoring settings reverts modified preferences back to their defaults', async ({
    page,
  }) => {
    await page.goto('/app/configuracoes?section=aparencia');
    await page.getByRole('radio', { name: 'Escuro' }).check();
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');

    await page.goto('/app/configuracoes?section=dados');
    await expect(page.getByRole('heading', { name: 'Dados', level: 2 })).toBeVisible();
    await page.getByRole('button', { name: 'Restaurar' }).click();

    await expect(page.getByRole('heading', { name: 'Restaurar configurações?' })).toBeVisible();
    await page.getByRole('button', { name: 'Restaurar' }).last().click();

    await page.goto('/app/configuracoes?section=aparencia');
    await expect(page.getByRole('radio', { name: 'Sistema' })).toBeChecked();
  });
});

test.describe('Settings — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('list → category → back → another category, with no horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/app/configuracoes');
    await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Categorias de configurações' });
    await expect(nav).toBeVisible();
    await nav.getByText('Aparência').click();

    await expect(page.getByRole('heading', { name: 'Aparência', level: 2 })).toBeVisible();
    await expect(nav).not.toBeVisible();

    await page.getByRole('radio', { name: 'Escuro' }).check();

    await page.getByRole('button', { name: 'Voltar para as categorias' }).click();
    await expect(nav).toBeVisible();

    await nav.getByText('Rotina').click();
    await expect(page.getByRole('heading', { name: 'Rotina', level: 2 })).toBeVisible();

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
