import { expect, type Page, test } from '@playwright/test';

/** Next Wednesday from "now" (today counts if it's already Wednesday) — computed at run time so the test never goes stale. */
function nextWednesday(): { day: string; month: string; year: string; isCurrentWeek: boolean } {
  const today = new Date();
  const daysUntilWednesday = (3 - today.getDay() + 7) % 7;
  const target = new Date(today);
  target.setDate(today.getDate() + daysUntilWednesday);
  return {
    day: String(target.getDate()).padStart(2, '0'),
    month: String(target.getMonth() + 1).padStart(2, '0'),
    year: String(target.getFullYear()),
    isCurrentWeek: daysUntilWednesday <= 6 - today.getDay(),
  };
}

async function fillDateField(
  page: Page,
  groupName: string,
  day: string,
  month: string,
  year: string,
) {
  const group = page.getByRole('group', { name: groupName });
  await group.locator('[aria-label="Day"]').click();
  await page.keyboard.type(day + month + year);
}

test.describe('Nutrition — main flow (Receita → Planejamento → Compras → Despensa)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a recipe planned this week produces a real shopping need that flows into the pantry', async ({
    page,
  }) => {
    const wednesday = nextWednesday();

    // 1-2. Access Nutrição, then Receitas.
    await page.goto('/app/nutricao');
    await expect(page.getByRole('heading', { name: 'Nutrição' })).toBeVisible();
    await page.getByRole('tab', { name: 'Receitas' }).click();
    await expect(page.getByRole('heading', { name: 'Receitas' })).toBeVisible();

    // 3. Select a recipe with ingredients not fully in the pantry.
    await page.getByRole('link', { name: /Macarrão ao molho de tomate/ }).click();
    await expect(page.getByRole('heading', { name: 'Macarrão ao molho de tomate' })).toBeVisible();

    // 4. Add it to the plan on Wednesday, at dinner.
    await page.getByRole('button', { name: 'Adicionar ao planejamento' }).click();
    await expect(page.getByRole('dialog', { name: 'Adicionar ao planejamento' })).toBeVisible();
    await fillDateField(page, 'Dia', wednesday.day, wednesday.month, wednesday.year);
    await page.getByLabel('Refeição').click();
    await page.getByRole('option', { name: 'Jantar' }).click();
    await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
    await expect(page.getByText('Receita adicionada ao planejamento.')).toBeVisible();

    // 5-6. Open Planejamento and find the recipe on Wednesday.
    await page.getByRole('tab', { name: 'Planejamento' }).click();
    await expect(page.getByRole('heading', { name: 'Planejamento' })).toBeVisible();
    if (!wednesday.isCurrentWeek) {
      await page.getByRole('button', { name: 'Próxima semana' }).click();
    }
    // Both the desktop grid and the tablet cards render (only one is
    // visible via CSS at this viewport) — `.first()` picks whichever
    // is actually shown, both carry the same content either way.
    await expect(
      page.getByRole('button', { name: /Macarrão ao molho de tomate/ }).first(),
    ).toBeVisible();

    // 7-8. Generate the shopping list for the week and verify calculated ingredients.
    await page.getByRole('button', { name: 'Gerar lista de compras' }).click();
    await expect(page.getByRole('dialog', { name: 'Gerar lista de compras' })).toBeVisible();
    await page.getByRole('button', { name: 'Esta semana' }).click();
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(page.getByText(/Macarrão espaguete/)).toBeVisible();
    await page.getByRole('button', { name: 'Adicionar às compras' }).click();
    await expect(page.getByText('Lista de compras atualizada.')).toBeVisible();

    // 9-10. Open Compras and check the ingredient as purchased.
    await page.getByRole('tab', { name: 'Compras' }).click();
    await expect(page.getByRole('heading', { name: 'Compras' })).toBeVisible();
    const macarraoRow = page.locator('p', { hasText: 'Macarrão espaguete' }).first();
    await expect(macarraoRow).toBeVisible();
    const macarraoCheckbox = macarraoRow.locator('xpath=ancestor::div[2]').getByRole('checkbox');
    await macarraoCheckbox.check();

    // 11. Send the purchased item to the pantry.
    await page.getByRole('button', { name: 'Guardar itens comprados' }).click();
    await expect(page.getByRole('dialog', { name: 'Guardar na despensa' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await expect(page.getByText('Itens guardados na despensa.')).toBeVisible();

    // 12-13. Open Despensa and confirm the ingredient is now available.
    await page.getByRole('tab', { name: 'Despensa' }).click();
    await expect(page.getByRole('heading', { name: 'Despensa' })).toBeVisible();
    await page.getByLabel('Buscar na despensa').fill('macarrão');
    await expect(page.getByText('Macarrão espaguete')).toBeVisible();
  });
});

test.describe('Nutrition — recipe creation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('creates a recipe with ingredients and steps, then verifies it on the detail page', async ({
    page,
  }) => {
    await page.goto('/app/nutricao/receitas/nova');
    await expect(page.getByRole('heading', { name: 'Nova receita' })).toBeVisible();

    await page.getByLabel('Nome da receita').fill('Salada de tomate e cebola');
    await page.getByLabel('Porções').fill('2');

    await page.getByRole('button', { name: 'Adicionar ingrediente' }).click();
    await page.getByRole('combobox', { name: 'Ingrediente', exact: true }).fill('Tomate');
    await page.getByLabel('Quantidade', { exact: true }).fill('2');

    await page.getByRole('button', { name: 'Adicionar etapa' }).click();
    await page.getByLabel('Etapa 1').fill('Corte o tomate e a cebola em rodelas finas.');

    await page.getByRole('button', { name: 'Salvar receita' }).click();

    await expect(page.getByText('Receita salva.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Salada de tomate e cebola' })).toBeVisible();
    await expect(page.getByText('2 un Tomate')).toBeVisible();
    await expect(page.getByText('Corte o tomate e a cebola em rodelas finas.')).toBeVisible();
  });
});

test.describe('Nutrition — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function expectNoHorizontalOverflow(page: Page) {
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  }

  test('Hoje, Planejamento and Compras stay usable with no horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/app/nutricao');
    await expect(page.getByRole('heading', { name: 'Nutrição' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'Planejamento' }).click();
    await expect(page.getByRole('heading', { name: 'Planejamento' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'Compras' }).click();
    await expect(page.getByRole('heading', { name: 'Compras' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('adds a manual item to the shopping list and marks it purchased', async ({ page }) => {
    await page.goto('/app/nutricao/compras');

    await page.getByRole('button', { name: 'Adicionar item' }).click();
    await expect(page.getByRole('dialog', { name: 'Adicionar item' })).toBeVisible();
    await page.getByLabel('Item', { exact: true }).fill('Guardanapo de papel');
    await page.getByLabel('Quantidade', { exact: true }).fill('1');
    await page.getByRole('button', { name: 'Adicionar', exact: true }).click();

    await expect(page.getByText('Item adicionado à lista de compras.')).toBeVisible();
    const row = page.locator('p', { hasText: 'Guardanapo de papel' }).first();
    await expect(row).toBeVisible();
    await row.locator('xpath=ancestor::div[2]').getByRole('checkbox').check();
    await expectNoHorizontalOverflow(page);
  });

  test('opens a recipe from the Receitas list with no overflow', async ({ page }) => {
    await page.goto('/app/nutricao/receitas');
    await expect(page.getByRole('heading', { name: 'Receitas' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('link', { name: /Frango grelhado com arroz e feijão/ }).click();
    await expect(
      page.getByRole('heading', { name: 'Frango grelhado com arroz e feijão' }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
