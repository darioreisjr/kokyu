import { expect, test } from '@playwright/test';

const viewports = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1440, height: 900 },
} as const;

for (const [name, size] of Object.entries(viewports)) {
  test.describe(`Login page — ${name} (${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    test('keeps the form visible with no horizontal overflow', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByLabel('E-mail')).toBeVisible();
      await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('keeps the primary call to action reachable', async ({ page }) => {
      await page.goto('/login');

      const submit = page.getByRole('button', { name: 'Entrar' });
      await expect(submit).toBeVisible();
      await expect(submit).toBeEnabled();

      const box = await submit.boundingBox();
      expect(box).not.toBeNull();
      // WCAG 2.2 AA target size: at least 24x24 CSS px.
      expect(box!.height).toBeGreaterThanOrEqual(24);
    });

    test('keeps the Google sign-in button reachable', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: /Continuar com Google/ })).toBeVisible();
    });
  });
}

test.describe('Login page — decorative visual panel', () => {
  test('is hidden below the desktop breakpoint', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/login');
    await expect(page.locator('aside[aria-hidden="true"]')).toBeHidden();
  });

  test('is shown at desktop width', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/login');
    await expect(page.locator('aside[aria-hidden="true"]')).toBeVisible();
  });
});
