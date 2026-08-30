import { expect, test } from '@playwright/test';

test.describe('404 — Respiração Perdida', () => {
  test('shows the 404 page for an unknown route', async ({ page }) => {
    const response = await page.goto('/essa-rota-nao-existe');
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Você saiu da rota de respiração' }),
    ).toBeVisible();
    await expect(
      page.getByText('Parece que esta missão levou você para um caminho que não existe.'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voltar ao início' })).toBeVisible();
  });

  test('navigates home when the CTA is clicked', async ({ page }) => {
    await page.goto('/essa-rota-nao-existe');

    await page.getByRole('link', { name: 'Voltar ao início' }).click();

    // "/" itself redirects straight to "/login" — that's the real end state.
    await expect(page).toHaveURL(/\/login$/);
  });
});

const viewports = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const;

for (const [name, size] of Object.entries(viewports)) {
  test.describe(`404 page — ${name} (${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    test('keeps the CTA visible and reachable with no horizontal overflow', async ({ page }) => {
      await page.goto('/essa-rota-nao-existe');

      const cta = page.getByRole('link', { name: 'Voltar ao início' });
      await expect(cta).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });
  });
}
