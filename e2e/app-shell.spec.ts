import { expect, test } from '@playwright/test';

import { navigationFlags } from './fixtures/flags';

/** Primary sections, in menu order, with their feature flag id and route. */
const primarySections = [
  { label: 'Respiração', flag: 'respiracao', route: '/app' },
  { label: 'Missões', flag: 'missoes', route: '/app/missoes' },
  { label: 'Ritmo Diário', flag: 'ritmo-diario', route: '/app/ritmo-diario' },
  { label: 'Treinamento', flag: 'treinamento', route: '/app/treinamento' },
  { label: 'Nutrição', flag: 'nutricao', route: '/app/nutricao' },
  { label: 'Hábitos', flag: 'habitos', route: '/app/habitos' },
  { label: 'Metas', flag: 'metas', route: '/app/metas' },
  { label: 'Tempo Livre', flag: 'tempo-livre', route: '/app/tempo-livre' },
] as const;

/** Splits the sections by the backend's feature flags: enabled ones are links, the rest are locked. */
async function sectionsByFlag() {
  const flags = await navigationFlags();
  return {
    enabled: primarySections.filter((section) => flags[section.flag]),
    locked: primarySections.filter((section) => !flags[section.flag]),
  };
}

// `/` needs no escaping inside `new RegExp`.
const routePattern = (route: string) => new RegExp(`${route}$`);

test.describe('App shell — desktop navigation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('full navigation, active state and collapse round-trip', async ({ page }) => {
    const { enabled, locked } = await sectionsByFlag();
    await page.goto('/app');
    const sidebar = page.locator('aside[aria-label="Barra lateral"]');
    await expect(sidebar).toBeVisible();

    // Enabled sections are links; the rest are disabled, marked "Em breve".
    for (const { label } of enabled) {
      await expect(sidebar.getByRole('link', { name: label })).toBeVisible();
    }
    for (const { label } of locked) {
      await expect(sidebar.getByRole('button', { name: new RegExp(`^${label}`) })).toBeDisabled();
    }

    // "Respiração" starts active.
    await expect(sidebar.getByRole('link', { name: 'Respiração' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    // Walk through every enabled section: URL, title and active state.
    for (const { label, route } of enabled) {
      await sidebar.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(routePattern(route));
      await expect(page.getByRole('heading', { name: label, level: 1 })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }

    // Collapse the sidebar and verify compact mode.
    await page.getByRole('button', { name: 'Recolher menu' }).click();
    await expect(page.getByRole('button', { name: 'Expandir menu' })).toBeVisible();
    await expect(sidebar.getByText('Tempo Livre')).not.toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Tempo Livre' })).toBeVisible();

    // Expand again.
    await page.getByRole('button', { name: 'Expandir menu' }).click();
    await expect(page.getByRole('button', { name: 'Recolher menu' })).toBeVisible();
    await expect(sidebar.getByText('Tempo Livre')).toBeVisible();
  });

  test('shows a tooltip for a collapsed item', async ({ page }) => {
    await page.goto('/app');
    await page.getByRole('button', { name: 'Recolher menu' }).click();

    await page.locator('aside').getByRole('link', { name: 'Tempo Livre' }).hover();
    await expect(page.getByRole('tooltip', { name: 'Tempo Livre' })).toBeVisible();
  });

  test('navigates to /app/perfil', async ({ page }) => {
    await page.goto('/app');

    await page.getByRole('link', { name: 'Perfil' }).click();
    await expect(page).toHaveURL(/\/app\/perfil$/);
    await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();

    // Configurações is behind a feature flag and logout lives in logout.spec.ts.
  });
});

test.describe('App shell — mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('drawer opens, navigates, closes and reflects the active item', async ({ page }) => {
    const { enabled } = await sectionsByFlag();
    // Access /app — no permanent sidebar.
    await page.goto('/app');
    await expect(page.locator('aside[aria-label="Barra lateral"]')).toBeHidden();

    // Open the menu and verify the enabled sections.
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const drawerNav = page.getByRole('navigation', { name: 'Navegação principal' });
    for (const { label } of enabled) {
      await expect(drawerNav.getByRole('link', { name: label })).toBeVisible();
    }

    // Select "Tempo Livre" — the drawer closes and the URL updates.
    await drawerNav.getByRole('link', { name: 'Tempo Livre' }).click();
    await expect(page).toHaveURL(/\/app\/tempo-livre$/);
    await expect(drawerNav).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tempo Livre', level: 1 })).toBeVisible();

    // Reopen the menu — "Tempo Livre" is active.
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(
      page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', {
        name: 'Tempo Livre',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('closes on Escape and shows the current page name in the top bar', async ({ page }) => {
    await page.goto('/app/tempo-livre');
    await expect(page.getByRole('heading', { name: 'Tempo Livre', level: 1 })).toBeVisible();
    await expect(page.locator('header').getByText('Tempo Livre', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const drawerNav = page.getByRole('navigation', { name: 'Navegação principal' });
    await expect(drawerNav.getByRole('link', { name: 'Respiração' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawerNav).not.toBeVisible();
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
