import { expect, test } from '@playwright/test';

test.describe('Respiração (Home)', () => {
  test('shows the day synthesis, completes a quick mission, and stays consistent after visiting Ritmo Diário', async ({
    page,
  }) => {
    // 1. Access Respiração.
    await page.goto('/app');
    await expect(page.getByRole('heading', { name: 'Respiração', level: 1 })).toBeAttached();

    // 2. Agora / Próximo.
    await expect(page.getByRole('heading', { name: 'Agora' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Próximo' })).toBeVisible();

    // 3. Em foco.
    await expect(page.getByRole('heading', { name: 'Em foco' })).toBeVisible();

    // 4. Áreas de hoje — Missões, Hábitos, Treinamento, Nutrição, Metas, Tempo Livre.
    // Card titles are `<h3>`, scoped by role/level to avoid matching the sidebar's own nav links of the same name.
    await expect(page.getByRole('heading', { name: 'Áreas de hoje' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Missões', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hábitos', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Treinamento', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nutrição', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Metas', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tempo Livre', level: 3 })).toBeVisible();

    // 5. Conclui uma Missão rapidamente em "Em foco".
    const focusMissionButton = page.getByRole('button', { name: /Concluir missão/ }).first();
    if (await focusMissionButton.isVisible().catch(() => false)) {
      await focusMissionButton.click();
      await expect(focusMissionButton).toBeDisabled();
    }

    // 6. Abre o Ritmo Diário a partir de "Próximo" e volta.
    await page.getByRole('button', { name: 'Ver dia completo' }).click();
    await expect(page).toHaveURL(/\/app\/ritmo-diario/);
    await expect(page.getByRole('heading', { name: 'Ritmo Diário' })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/app$/);

    // 7. O snapshot continua consistente após voltar.
    await expect(page.getByRole('heading', { name: 'Agora' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Áreas de hoje' })).toBeVisible();
  });

  test('opens "Personalizar Respiração" and hides a section', async ({ page }) => {
    await page.goto('/app');
    await expect(page.getByRole('heading', { name: 'Agora' })).toBeVisible();

    await page.getByText('Personalizar Respiração').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('switch', { name: 'Mostrar seção Precisa de atenção' }).click();
    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Respiração — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('renders Agora/Próximo/Em foco/Áreas/Adicionar without horizontal overflow', async ({ page }) => {
    await page.goto('/app');

    await expect(page.getByRole('heading', { name: 'Agora' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Próximo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Em foco' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Áreas de hoje' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Adicionar', level: 2 })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
