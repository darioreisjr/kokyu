import path from 'node:path';
import { expect, test } from '@playwright/test';

const testImage = path.resolve(__dirname, '../coverage/favicon.png');

test.describe('Profile page', () => {
  test('loads with the expected data — avatar, name, username, email', async ({ page }) => {
    await page.goto('/app/perfil');

    await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();
    await expect(page.getByText('DR')).toBeVisible();
    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Dario');
    await expect(page.getByLabel('Sobrenome')).toHaveValue('Reis');
    await expect(page.getByLabel('Username')).toHaveValue('darioreis');
    await expect(page.getByLabel('E-mail')).toHaveValue('dario@email.com');
    await expect(page.getByText('Dario Reis')).toBeVisible();
    await expect(page.getByText('@darioreis')).toBeVisible();
  });

  test('edits the name, saves, and shows the success feedback', async ({ page }) => {
    await page.goto('/app/perfil');

    const firstName = page.getByLabel('Nome', { exact: true });
    await firstName.fill('Dario Editado');

    const saveButton = page.getByRole('button', { name: 'Salvar alterações' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(page.getByText('Perfil atualizado com sucesso.')).toBeVisible();
    await expect(saveButton).toBeDisabled();
    // The live preview reflects the saved value too.
    await expect(page.getByText('Dario Editado Reis')).toBeVisible();
  });

  test('changes the username, checks availability, and saves', async ({ page }) => {
    await page.goto('/app/perfil');

    const username = page.getByLabel('Username');
    await username.fill('novo_username');

    await expect(page.getByText('Username disponível')).toBeVisible({ timeout: 3000 });

    const saveButton = page.getByRole('button', { name: 'Salvar alterações' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(page.getByText('Perfil atualizado com sucesso.')).toBeVisible();
  });

  test('reports an unavailable username and blocks saving', async ({ page }) => {
    await page.goto('/app/perfil');

    const username = page.getByLabel('Username');
    await username.fill('admin');

    await expect(page.getByText('Este username já está em uso')).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  test('rejects a birth date that makes the user younger than 18', async ({ page }) => {
    await page.goto('/app/perfil');

    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
    const day = String(seventeenYearsAgo.getDate()).padStart(2, '0');
    const month = String(seventeenYearsAgo.getMonth() + 1).padStart(2, '0');
    const year = seventeenYearsAgo.getFullYear();

    const group = page.getByRole('group', { name: 'Data de nascimento' });
    await group.locator('[aria-label="Day"]').click();
    await page.keyboard.type(`${day}${month}${year}`);
    await page.keyboard.press('Tab');

    await expect(page.getByText('Você precisa ter pelo menos 18 anos.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  test('selects, crops and confirms an avatar, updating the preview', async ({ page }) => {
    await page.goto('/app/perfil');

    await page.getByLabel('Foto de perfil').setInputFiles(testImage);

    const dialog = page.getByRole('dialog', { name: 'Ajustar foto' });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(500);

    // Zoom is a usable, keyboard-accessible essential control.
    const zoomSlider = page.getByRole('slider', { name: 'Zoom' });
    await zoomSlider.focus();
    await page.keyboard.press('ArrowRight');

    await page.getByRole('button', { name: 'Usar esta foto' }).click();
    await expect(dialog).not.toBeVisible();

    // The cropped result shows up immediately as the avatar preview.
    await expect(page.getByRole('img', { name: 'Foto de perfil de Dario Reis' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remover foto' })).toBeVisible();

    const saveButton = page.getByRole('button', { name: 'Salvar alterações' });
    await expect(saveButton).toBeEnabled();
  });

  test('discards changes back to the originally loaded values', async ({ page }) => {
    await page.goto('/app/perfil');

    const firstName = page.getByLabel('Nome', { exact: true });
    await firstName.fill('Dario Editado');
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();

    await page.getByRole('button', { name: 'Descartar alterações' }).click();

    await expect(firstName).toHaveValue('Dario');
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  test('cancels the crop dialog without changing the avatar', async ({ page }) => {
    await page.goto('/app/perfil');

    await page.getByLabel('Foto de perfil').setInputFiles(testImage);
    const dialog = page.getByRole('dialog', { name: 'Ajustar foto' });
    await expect(dialog).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).not.toBeVisible();

    // Still the initials fallback — nothing was staged.
    await expect(page.getByText('DR')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  test('removes an existing avatar back to initials', async ({ page }) => {
    await page.goto('/app/perfil');

    await page.getByLabel('Foto de perfil').setInputFiles(testImage);
    await expect(page.getByRole('dialog', { name: 'Ajustar foto' })).toBeVisible();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Usar esta foto' }).click();
    await expect(page.getByRole('button', { name: 'Remover foto' })).toBeVisible();

    await page.getByRole('button', { name: 'Remover foto' }).click();

    await expect(page.getByText('DR')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();
  });
});

const viewports = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1440, height: 1000 },
} as const;

for (const [name, size] of Object.entries(viewports)) {
  test.describe(`Profile page — ${name} (${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    test('keeps the form usable with no horizontal overflow', async ({ page }) => {
      await page.goto('/app/perfil');

      await expect(page.getByLabel('Nome', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('the crop dialog stays usable', async ({ page }) => {
      await page.goto('/app/perfil');

      await page.getByLabel('Foto de perfil').setInputFiles(testImage);
      const dialog = page.getByRole('dialog', { name: 'Ajustar foto' });
      await expect(dialog).toBeVisible();

      await expect(page.getByRole('button', { name: 'Usar esta foto' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('the app shell navigation is still reachable', async ({ page }) => {
      await page.goto('/app/perfil');

      if (name === 'mobile') {
        await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
      } else {
        await expect(page.locator('aside[aria-label="Barra lateral"]')).toBeVisible();
      }
    });
  });
}
