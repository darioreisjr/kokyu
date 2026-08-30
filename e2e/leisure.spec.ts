import { expect, type Page, test } from '@playwright/test';

/** Next Saturday from "now" (today counts if it's already Saturday) — computed at run time so the test never goes stale. */
function nextSaturday(): { day: string; month: string; year: string; isCurrentWeek: boolean } {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
  const target = new Date(today);
  target.setDate(today.getDate() + daysUntilSaturday);
  return {
    day: String(target.getDate()).padStart(2, '0'),
    month: String(target.getMonth() + 1).padStart(2, '0'),
    year: String(target.getFullYear()),
    isCurrentWeek: daysUntilSaturday <= 6 - today.getDay(),
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

test.describe('Tempo Livre — main flow (Para depois → Organizar → Biblioteca → Planejamento → Histórico)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a quick-captured item gets organized, planned, watched, rated and logged', async ({
    page,
  }) => {
    const saturday = nextSaturday();

    // 1. Access Tempo Livre.
    await page.goto('/app/tempo-livre');
    await expect(page.getByRole('heading', { name: 'Tempo Livre' })).toBeVisible();

    // 2. Guardar um filme em Para depois.
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('menuitem', { name: 'Item para depois' }).click();
    await expect(page.getByRole('dialog', { name: 'Guardar para depois' })).toBeVisible();
    await page.getByLabel('Título').fill('Duna: Parte Dois');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Adicionado para depois.')).toBeVisible();

    // 3. Abrir Para depois.
    await page.getByRole('tab', { name: 'Para depois' }).click();
    await expect(page.getByRole('heading', { name: 'Para depois' })).toBeVisible();
    await expect(page.getByText('Duna: Parte Dois')).toBeVisible();

    // 4. Organizar como Filme.
    await page.getByRole('button', { name: 'Organizar' }).click();
    const organizeDialog = page.getByRole('dialog', { name: 'Editar item' });
    await expect(organizeDialog).toBeVisible();
    await organizeDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Item organizado.')).toBeVisible();

    // 5. Mover para Biblioteca — organizar já classifica o item como filme, então ele passa a aparecer lá.
    await page.getByRole('tab', { name: 'Biblioteca' }).click();
    await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Duna: Parte Dois/ })).toBeVisible();

    // 6. Planejar para sábado.
    await page.getByRole('link', { name: /Duna: Parte Dois/ }).click();
    await expect(page.getByRole('heading', { name: 'Duna: Parte Dois' })).toBeVisible();
    await page.getByRole('button', { name: 'Planejar' }).click();
    const planDialog = page.getByRole('dialog', { name: 'Planejar atividade' });
    await expect(planDialog).toBeVisible();
    await fillDateField(page, 'Dia', saturday.day, saturday.month, saturday.year);
    await planDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Atividade planejada.')).toBeVisible();

    // 7-8. Abrir Planejamento e verificar o filme.
    await page.getByRole('tab', { name: 'Planejamento' }).click();
    await expect(page.getByRole('heading', { name: 'Planejamento' })).toBeVisible();
    if (!saturday.isCurrentWeek) {
      await page.getByRole('button', { name: 'Próxima semana' }).click();
    }
    await expect(page.getByText('Duna: Parte Dois')).toBeVisible();

    // 9. Marcar como assistido, com avaliação — a partir da Biblioteca (a
    // linha do planejamento abre "Editar planejamento" ao ser clicada, não
    // navega para o item).
    await page.getByRole('tab', { name: 'Biblioteca' }).click();
    await page.getByRole('link', { name: /Duna: Parte Dois/ }).click();
    await expect(page.getByRole('heading', { name: 'Duna: Parte Dois' })).toBeVisible();
    await page.getByRole('button', { name: 'Marcar como concluído' }).click();
    const logDialog = page.getByRole('dialog', { name: 'Registrar experiência' });
    await expect(logDialog).toBeVisible();
    // MUI Rating's radio inputs are visually hidden (their label draws the
    // visible star), so a real pointer click on the input itself would be
    // intercepted by that label — `force` clicks the input directly instead.
    await logDialog.getByRole('radio', { name: '5 de 5 estrelas' }).click({ force: true });
    await logDialog.getByRole('button', { name: 'Registrar' }).click();
    await expect(page.getByText('Item concluído.')).toBeVisible();

    // 10. Abrir Histórico e verificar o registro.
    await page.getByRole('tab', { name: 'Histórico' }).click();
    await expect(page.getByRole('heading', { name: 'Histórico' })).toBeVisible();
    await expect(page.getByText('Duna: Parte Dois')).toBeVisible();
  });
});

test.describe('Tempo Livre — "O que cabe agora?"', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('picking an available duration surfaces a fitting suggestion and starting it marks it in progress', async ({
    page,
  }) => {
    // 1. Acessar Hoje.
    await page.goto('/app/tempo-livre');
    await expect(page.getByRole('heading', { name: 'Tempo Livre' })).toBeVisible();

    // 2. Selecionar 30 minutos.
    await page.getByRole('button', { name: '30 min' }).click();

    // 3. Verificar sugestões — o vídeo de 18 min ainda está no backlog, então
    // dá para verificar uma transição de status real ao começá-lo.
    await expect(page.getByText('Tutorial: primeiros acordes')).toBeVisible();

    // 4-5. Selecionar uma e começar.
    const card = page.getByRole('link', { name: /Tutorial: primeiros acordes/ });
    const row = card.locator('xpath=ancestor::div[2]');
    await row.getByRole('button', { name: 'Começar' }).click();
    await expect(page.getByText('Atividade iniciada.')).toBeVisible();

    // 6. Verificar status Em andamento.
    const inProgressSection = page.getByText('Em andamento').locator('xpath=..');
    await expect(inProgressSection.getByText('Tutorial: primeiros acordes')).toBeVisible();
  });
});

test.describe('Tempo Livre — Notas', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('creates, tags, pins, edits and archives a note', async ({ page }) => {
    await page.goto('/app/tempo-livre/notas');
    await expect(page.getByRole('heading', { name: 'Notas' })).toBeVisible();

    // 1-2. Criar nota, adicionando uma tag.
    await page.getByRole('button', { name: 'Nova nota' }).click();
    const createDialog = page.getByRole('dialog', { name: 'Nova nota' });
    await expect(createDialog).toBeVisible();
    await createDialog.getByLabel('Conteúdo').fill('Comprar cordas novas para o violão.');
    await createDialog.getByLabel('Tags (opcional)').fill('hobby');
    await page.keyboard.press('Enter');
    await createDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Nota salva.')).toBeVisible();

    const noteCard = page.locator('p', { hasText: 'Comprar cordas novas para o violão.' }).first();
    await expect(noteCard).toBeVisible();
    const card = noteCard.locator('xpath=ancestor::div[contains(@class, "MuiPaper-root")][1]');

    // 3. Fixar.
    await card.getByRole('button', { name: 'Fixar nota' }).click();
    await expect(card.getByRole('button', { name: 'Desafixar nota' })).toBeVisible();

    // 4. Editar.
    await noteCard.click();
    const editDialog = page.getByRole('dialog', { name: 'Editar nota' });
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel('Conteúdo').fill('Comprar cordas novas e uma capa para o violão.');
    await editDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Nota atualizada.')).toBeVisible();

    // 5. Arquivar.
    const updatedCard = page
      .locator('p', { hasText: 'Comprar cordas novas e uma capa para o violão.' })
      .first()
      .locator('xpath=ancestor::div[contains(@class, "MuiPaper-root")][1]');
    await updatedCard.getByRole('button', { name: 'Arquivar nota' }).click();
    await expect(page.getByText('Nota arquivada.')).toBeVisible();
    await expect(
      page.getByText('Comprar cordas novas e uma capa para o violão.'),
    ).not.toBeVisible();
  });
});

test.describe('Tempo Livre — Lugar', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('adds a place, plans a visit, marks it visited and finds it in the history', async ({
    page,
  }) => {
    await page.goto('/app/tempo-livre/lugares');
    await expect(page.getByRole('heading', { name: 'Lugares & Passeios' })).toBeVisible();

    // 1. Adicionar lugar.
    await page.getByRole('button', { name: 'Adicionar' }).click();
    const addDialog = page.getByRole('dialog', { name: 'Novo item' });
    await expect(addDialog).toBeVisible();
    await addDialog.getByLabel('Tipo').click();
    await page.getByRole('option', { name: 'Lugar' }).click();
    await addDialog.getByLabel('Título').fill('Parque Ibirapuera');
    await addDialog.getByLabel('Categoria').click();
    await page.getByRole('option', { name: 'Parque' }).click();
    await addDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Item salvo.')).toBeVisible();

    // 2. "Quero conhecer" é o status padrão de um lugar recém-criado.
    const card = page
      .locator('a', { hasText: 'Parque Ibirapuera' })
      .first()
      .locator('xpath=ancestor::div[1]');
    await expect(card.getByText('Quero conhecer')).toBeVisible();

    // 3. Planejar data.
    await card.getByRole('button', { name: 'Planejar' }).click();
    const planDialog = page.getByRole('dialog', { name: 'Planejar atividade' });
    await expect(planDialog).toBeVisible();
    await planDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Atividade planejada.')).toBeVisible();

    // 4. Marcar visitado.
    await card.getByRole('button', { name: 'Marcar visitado' }).click();
    const visitDialog = page.getByRole('dialog', { name: 'Registrar experiência' });
    await expect(visitDialog).toBeVisible();
    await visitDialog.getByRole('button', { name: 'Registrar' }).click();
    await expect(page.getByText('Visita registrada.')).toBeVisible();

    // 5. Verificar Histórico.
    await page.getByRole('tab', { name: 'Histórico' }).click();
    await expect(page.getByRole('heading', { name: 'Histórico' })).toBeVisible();
    await expect(page.getByText('Parque Ibirapuera')).toBeVisible();
  });
});

test.describe('Tempo Livre — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function expectNoHorizontalOverflow(page: Page) {
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  }

  test('internal navigation, quick capture and "O que cabe agora?" stay usable with no horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/app/tempo-livre');
    await expect(page.getByRole('heading', { name: 'Tempo Livre' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: '15 min' }).click();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'Biblioteca' }).click();
    await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'Planejamento' }).click();
    await expect(page.getByRole('heading', { name: 'Planejamento' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('quick-captures an item and creates a note with no overflow', async ({ page }) => {
    await page.goto('/app/tempo-livre');

    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('menuitem', { name: 'Item para depois' }).click();
    await expect(page.getByRole('dialog', { name: 'Guardar para depois' })).toBeVisible();
    await page.getByLabel('Título').fill('Restaurante que vi no feed');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Adicionado para depois.')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'Notas' }).click();
    await page.getByRole('button', { name: 'Nova nota' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nova nota' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Conteúdo').fill('Nota rápida do celular.');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Nota salva.')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
