import { expect, test } from '@playwright/test';

const primaryLabels = [
  'Respiração',
  'Missões',
  'Ritmo Diário',
  'Treinamento',
  'Nutrição',
  'Hábitos',
  'Metas',
  'Tempo Livre',
];

test.describe('App shell — desktop navigation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('full navigation, active state and collapse round-trip', async ({ page }) => {
    // 1-2. Access /app and verify the menu.
    await page.goto('/app');
    const sidebar = page.locator('aside[aria-label="Barra lateral"]');
    await expect(sidebar).toBeVisible();
    for (const label of primaryLabels) {
      await expect(sidebar.getByRole('link', { name: label })).toBeVisible();
    }

    // 3. "Respiração" starts active.
    await expect(sidebar.getByRole('link', { name: 'Respiração' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    // 4-7. Navigate to "Missões" and confirm URL, title and active state.
    await sidebar.getByRole('link', { name: 'Missões' }).click();
    await expect(page).toHaveURL(/\/app\/missoes$/);
    await expect(page.getByRole('heading', { name: 'Missões' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Missões' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(sidebar.getByRole('link', { name: 'Respiração' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );

    // 8. Walk through every remaining primary item.
    const routeByLabel: Record<string, string> = {
      Respiração: '/app',
      Missões: '/app/missoes',
      'Ritmo Diário': '/app/ritmo-diario',
      Treinamento: '/app/treinamento',
      Nutrição: '/app/nutricao',
      Hábitos: '/app/habitos',
      Metas: '/app/metas',
      'Tempo Livre': '/app/tempo-livre',
    };
    for (const label of primaryLabels) {
      await sidebar.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`${routeByLabel[label]!.replace(/\//g, '\\/')}$`));
      await expect(page.getByRole('heading', { name: label })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }

    // 9-10. Collapse the sidebar and verify compact mode.
    await page.getByRole('button', { name: 'Recolher menu' }).click();
    await expect(page.getByRole('button', { name: 'Expandir menu' })).toBeVisible();
    await expect(sidebar.getByText('Tempo Livre')).not.toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Tempo Livre' })).toBeVisible();

    // 11. Expand again.
    await page.getByRole('button', { name: 'Expandir menu' }).click();
    await expect(page.getByRole('button', { name: 'Recolher menu' })).toBeVisible();
    await expect(sidebar.getByText('Tempo Livre')).toBeVisible();
  });

  test('shows a tooltip for a collapsed item', async ({ page }) => {
    await page.goto('/app');
    await page.getByRole('button', { name: 'Recolher menu' }).click();

    const treinamentoLink = page.locator('aside').getByRole('link', { name: 'Treinamento' });
    await treinamentoLink.hover();
    await expect(page.getByRole('tooltip', { name: 'Treinamento' })).toBeVisible();
  });

  test('navigates to /app/perfil, /app/configuracoes and logs out to /login', async ({ page }) => {
    await page.goto('/app');

    await page.getByRole('link', { name: 'Perfil' }).click();
    await expect(page).toHaveURL(/\/app\/perfil$/);
    await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();

    await page.getByRole('link', { name: 'Configurações' }).click();
    await expect(page).toHaveURL(/\/app\/configuracoes$/);
    await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();

    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('App shell — mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('drawer opens, navigates, closes and reflects the active item', async ({ page }) => {
    // 1-2. Access /app — no permanent sidebar.
    await page.goto('/app');
    await expect(page.locator('aside[aria-label="Barra lateral"]')).toBeHidden();

    // 3-4. Open the menu and verify items.
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const drawerNav = page.getByRole('navigation', { name: 'Navegação principal' });
    for (const label of primaryLabels) {
      await expect(drawerNav.getByRole('link', { name: label })).toBeVisible();
    }

    // 5-7. Select "Treinamento" — the drawer closes and the URL updates.
    await drawerNav.getByRole('link', { name: 'Treinamento' }).click();
    await expect(page).toHaveURL(/\/app\/treinamento$/);
    await expect(drawerNav).not.toBeVisible();

    // 8. Verify the page title.
    await expect(page.getByRole('heading', { name: 'Treinamento' })).toBeVisible();

    // 9-10. Reopen the menu — "Treinamento" is active.
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(
      page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', {
        name: 'Treinamento',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('closes on Escape and shows the current page name in the top bar', async ({ page }) => {
    await page.goto('/app/nutricao');
    await expect(page.getByRole('heading', { name: 'Nutrição' })).toBeVisible();
    await expect(page.locator('header').getByText('Nutrição', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(page.getByRole('link', { name: 'Metas' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('link', { name: 'Metas' })).not.toBeVisible();
  });

  test('logs out from the drawer', async ({ page }) => {
    await page.goto('/app');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByRole('button', { name: 'Sair' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});

const viewports = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1440, height: 900 },
} as const;

for (const [name, size] of Object.entries(viewports)) {
  test.describe(`App shell — ${name} (${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    test('keeps the page reachable with no horizontal overflow', async ({ page }) => {
      await page.goto('/app');

      await expect(page.getByRole('heading', { name: 'Respiração' })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });
  });
}

test.describe('App shell — tablet', () => {
  test.use({ viewport: { width: 820, height: 1180 } });

  test('shows the sidebar collapsed by default, expandable on demand', async ({ page }) => {
    await page.goto('/app');

    const sidebar = page.locator('aside[aria-label="Barra lateral"]');
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole('button', { name: 'Expandir menu' })).toBeVisible();
    await expect(sidebar.getByText('Respiração')).not.toBeVisible();

    await page.getByRole('button', { name: 'Expandir menu' }).click();
    await expect(sidebar.getByText('Respiração')).toBeVisible();
  });
});
