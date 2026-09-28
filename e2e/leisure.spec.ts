import { expect, type Locator, type Page, test } from '@playwright/test';

// Unique per run: the local database keeps data between runs, and a
// leftover "Duna: Parte Dois" from a previous run would match twice.
const RUN = Date.now().toString(36);
const DUNA = `Duna: Parte Dois ${RUN}`;
const PARK = `Parque Ibirapuera ${RUN}`;
const TUTORIAL = `Tutorial: primeiros acordes ${RUN}`;
const NOTE = `Comprar cordas novas para o violão ${RUN}.`;
const NOTE_EDITED = `Comprar cordas novas e uma capa para o violão ${RUN}.`;
const LATER_ITEM = `Restaurante que vi no feed ${RUN}`;
const MOBILE_NOTE = `Nota rápida do celular ${RUN}.`;

/** Next Saturday from "now" (today counts if it's already Saturday) — computed at run time so the test never goes stale. */
function nextSaturday(): { day: string; month: string; year: string; isCurrentWeek: boolean } {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const target = new Date(today);
  target.setDate(today.getDate() + daysUntilSaturday);
  return {
    day: String(target.getDate()).padStart(2, '0'),
    month: String(target.getMonth() + 1).padStart(2, '0'),
    year: String(target.getFullYear()),
    // The planner's weeks start on Monday (the default "weekStartsOn: 1").
    isCurrentWeek: ((today.getDay() + 6) % 7) + daysUntilSaturday <= 6,
  };
}

/** Planning requires start time, end time and duration (on top of the day). */
async function fillPlanTimes(dialog: Locator) {
  await dialog.getByLabel('Início').fill('19:00');
  await dialog.getByLabel('Fim').fill('20:00');
  await dialog.getByLabel('Duração em minutos').fill('60');
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
    await page.getByLabel('Título').fill(DUNA);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Adicionado para depois.')).toBeVisible();

    // 3. Abrir Para depois.
    await page.getByRole('tab', { name: 'Para depois' }).click();
    await expect(page.getByRole('heading', { name: 'Para depois' })).toBeVisible();
    await expect(page.getByText(DUNA)).toBeVisible();

    // 4. Organizar como Filme.
    // The row of this run's item (older runs may have left others in the list).
    await page
      .getByText(DUNA)
      .locator('xpath=ancestor::*[.//button[normalize-space()="Organizar"]][1]')
      .getByRole('button', { name: 'Organizar' })
      .click();
    const organizeDialog = page.getByRole('dialog', { name: 'Editar item' });
    await expect(organizeDialog).toBeVisible();
    await organizeDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Item organizado.')).toBeVisible();

    // 5. Mover para Biblioteca — organizar já classifica o item como filme, então ele passa a aparecer lá.
    await page.getByRole('tab', { name: 'Biblioteca' }).click();
    await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible();
    await expect(page.getByRole('link', { name: new RegExp(DUNA) })).toBeVisible();

    // 6. Planejar para sábado.
    await page.getByRole('link', { name: new RegExp(DUNA) }).click();
    await expect(page.getByRole('heading', { name: DUNA })).toBeVisible();
    await page.getByRole('button', { name: 'Planejar' }).click();
    const planDialog = page.getByRole('dialog', { name: 'Planejar atividade' });
    await expect(planDialog).toBeVisible();
    await fillDateField(page, 'Dia', saturday.day, saturday.month, saturday.year);
    await fillPlanTimes(planDialog);
    await planDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Atividade planejada.')).toBeVisible();

    // 7-8. Abrir Planejamento e verificar o filme.
    await page.getByRole('tab', { name: 'Planejamento' }).click();
    await expect(page.getByRole('heading', { name: 'Planejamento' })).toBeVisible();
    if (!saturday.isCurrentWeek) {
      await page.getByRole('button', { name: 'Próxima semana' }).click();
    }
    await expect(page.getByText(DUNA)).toBeVisible();

    // 9. Marcar como assistido, com avaliação — a partir da Biblioteca (a
    // linha do planejamento abre "Editar planejamento" ao ser clicada, não
    // navega para o item).
    await page.getByRole('tab', { name: 'Biblioteca' }).click();
    await page.getByRole('link', { name: new RegExp(DUNA) }).click();
    await expect(page.getByRole('heading', { name: DUNA })).toBeVisible();
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
    await expect(page.getByText(DUNA)).toBeVisible();
  });
});

test.describe('Tempo Livre — "O que cabe agora?"', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('picking an available duration surfaces a fitting suggestion and starting it marks it in progress', async ({
    page,
  }) => {
    // 1. Acessar Hoje e criar um hobby de 18 min (um usuário novo não tem itens).
    await page.goto('/app/tempo-livre');
    await expect(page.getByRole('heading', { name: 'Tempo Livre', level: 1 })).toBeVisible();
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('menuitem', { name: 'Hobby' }).click();
    const addDialog = page.getByRole('dialog', { name: 'Novo item' });
    await addDialog.getByLabel('Título').fill(TUTORIAL);
    await addDialog.getByLabel('Duração', { exact: true }).click();
    await page.getByRole('option', { name: 'Fixa' }).click();
    await addDialog.getByLabel('Duração (min)').fill('18');
    await addDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(addDialog).not.toBeVisible();

    // 2. Selecionar 30 minutos.
    await page.getByRole('button', { name: '30 min' }).click();

    // 3. O hobby de 18 min, ainda em "Quero experimentar", cabe.
    await expect(page.getByText(TUTORIAL).first()).toBeVisible();

    // 4-5. Selecionar uma e começar.
    const card = page.getByRole('link', { name: new RegExp(TUTORIAL) });
    const row = card.locator('xpath=ancestor::div[2]');
    await row.getByRole('button', { name: 'Começar' }).click();
    await expect(page.getByText('Atividade iniciada.')).toBeVisible();

    // 6. Verificar status Em andamento.
    const inProgressSection = page.getByText('Em andamento').locator('xpath=..');
    await expect(inProgressSection.getByText(TUTORIAL)).toBeVisible();
  });
});

test.describe('Tempo Livre — Notas', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('creates, tags, pins, edits and archives a note', async ({ page }) => {
    await page.goto('/app/tempo-livre/notas');
    await expect(page.getByRole('heading', { name: 'Notas' })).toBeVisible();

    // 1-2. Criar nota (uma página), adicionando uma tag.
    await page.getByRole('button', { name: 'Nova nota' }).first().click();
    await expect(page.getByRole('heading', { name: 'Nova nota', level: 1 })).toBeVisible();
    await page.getByLabel('Conteúdo').fill(NOTE);
    await page.getByLabel('Tags (opcional)').fill('hobby');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Nota salva.')).toBeVisible();

    const noteCard = page.locator('p', { hasText: NOTE }).first();
    await expect(noteCard).toBeVisible();
    const card = noteCard.locator('xpath=ancestor::div[contains(@class, "MuiPaper-root")][1]');
    await expect(card.getByText('hobby')).toBeVisible();

    // 3. Fixar.
    await card.getByRole('button', { name: 'Fixar nota' }).click();
    await expect(card.getByRole('button', { name: 'Desafixar nota' })).toBeVisible();

    // 4. Abrir o popup da nota e ir para Editar (uma página).
    await noteCard.click();
    const detail = page.getByRole('dialog');
    await expect(detail.getByText(NOTE)).toBeVisible();
    await detail.getByRole('link', { name: 'Editar' }).click();
    await expect(page.getByRole('heading', { name: 'Editar nota', level: 1 })).toBeVisible();
    await page.getByLabel('Conteúdo').fill(NOTE_EDITED);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Nota atualizada.')).toBeVisible();

    // 5. Arquivar — pela página de edição, com confirmação.
    await page.locator('p', { hasText: NOTE_EDITED }).first().click();
    await page.getByRole('dialog').getByRole('link', { name: 'Editar' }).click();
    await expect(page.getByRole('heading', { name: 'Editar nota', level: 1 })).toBeVisible();
    await page.getByRole('button', { name: 'Arquivar' }).click();
    await page
      .getByRole('dialog', { name: 'Arquivar nota?' })
      .getByRole('button', { name: 'Arquivar' })
      .click();
    await expect(page.getByText(/Nota arquivada/)).toBeVisible();
    await expect(page.getByText(NOTE_EDITED)).not.toBeVisible();
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
    await addDialog.getByLabel('Título').fill(PARK);
    await addDialog.getByLabel('Categoria').click();
    await page.getByRole('option', { name: 'Parque' }).click();
    await addDialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Item salvo.')).toBeVisible();

    // 2. "Quero conhecer" é o status padrão de um lugar recém-criado.
    const card = page.locator('a', { hasText: PARK }).first().locator('xpath=ancestor::div[1]');
    await expect(card.getByText('Quero conhecer')).toBeVisible();

    // 3. Planejar data.
    await card.getByRole('button', { name: 'Planejar' }).click();
    const planDialog = page.getByRole('dialog', { name: 'Planejar atividade' });
    await expect(planDialog).toBeVisible();
    const saturday = nextSaturday();
    await fillDateField(page, 'Dia', saturday.day, saturday.month, saturday.year);
    await fillPlanTimes(planDialog);
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
    await expect(page.getByText(PARK)).toBeVisible();
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
    await page.getByLabel('Título').fill(LATER_ITEM);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Adicionado para depois.')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'Notas' }).click();
    await page.getByRole('button', { name: 'Nova nota' }).first().click();
    await expect(page.getByRole('heading', { name: 'Nova nota', level: 1 })).toBeVisible();
    await page.getByLabel('Conteúdo').fill(MOBILE_NOTE);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Nota salva.')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
