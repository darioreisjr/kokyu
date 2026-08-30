import { expect, type Page, test } from '@playwright/test';

async function goThroughStep(page: Page) {
  await page.getByRole('button', { name: 'Continuar' }).click();
}

/**
 * `KokyuButton`'s ripple mounts a child span right as this submit button is clicked, which right
 * at that same instant kicks off `router.push` to the new goal's detail page — Playwright's own
 * post-click stability re-check occasionally treats that ripple-then-unmount sequence as a failed
 * click and retries against an element that's already gone, hanging until the test timeout even
 * though the click (and the navigation it caused) already succeeded. Verified with a standalone
 * repro: the app always creates the goal and navigates correctly; only Playwright's own
 * bookkeeping times out. A short `click` timeout plus asserting on the real signal (the URL
 * change) sidesteps that without masking an actual regression — if the goal is never created, the
 * `waitForURL` below still fails for real.
 */
async function submitGoalForm(page: Page) {
  await page
    .getByRole('button', { name: 'Criar meta' })
    .click({ timeout: 3000 })
    .catch(() => {});
  await page.waitForURL(/\/app\/metas\/[^/]+$/, { timeout: 10000 });
}

test.describe('Metas — meta automática vinculada a Tempo Livre', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('cria uma meta automática, vê o progresso vindo de Tempo Livre e registra um check-in', async ({
    page,
  }) => {
    // 1. Acessar Metas.
    await page.goto('/app/metas');
    await expect(page.getByRole('heading', { name: 'Metas' })).toBeVisible();

    // 2. Criar nova Meta.
    await page.getByRole('link', { name: 'Nova meta' }).click();
    await expect(page.getByRole('heading', { name: 'Nova meta' })).toBeVisible();
    await page.getByLabel('Título').fill('Ler 20 livros este ano (E2E)');
    await goThroughStep(page);

    // 3. Escolher Tempo Livre.
    await page.getByRole('radio', { name: 'Tempo Livre' }).click();
    await goThroughStep(page);

    // 4. Tipo "Número" (padrão) — segue para configurar a medição.
    await goThroughStep(page);

    // Configurar medição — alvo 20.
    const targetField = page.getByLabel('Alvo', { exact: true });
    await targetField.fill('20');
    await goThroughStep(page);

    // 5. Prazo — data inicial já vem preenchida com hoje.
    await goThroughStep(page);

    // 6. Selecionar acompanhamento automático.
    await page.getByLabel('Atualização').click();
    await page
      .getByRole('option', { name: 'Automaticamente, vinculado a um módulo Kokyu' })
      .click();
    await page.getByLabel('Fonte').click();
    await page.getByRole('option', { name: 'Tempo Livre' }).click();

    // 7. Escolher "Livros concluídos" e salvar.
    await page.getByLabel('Métrica').click();
    await page.getByRole('option', { name: 'Livros concluídos' }).click();
    await goThroughStep(page);
    await submitGoalForm(page);

    // 8. Abrir o detalhe e verificar o progresso automático.
    await expect(page.getByRole('heading', { name: 'Ler 20 livros este ano (E2E)' })).toBeVisible();
    await expect(page.getByText('Atualizado automaticamente pelo Kokyu.')).toBeVisible();
    await expect(page.getByText('Progresso: 8 de 20 livros, 40%.')).toBeVisible();

    // 9. Adicionar um check-in.
    await page.getByRole('button', { name: 'Fazer check-in' }).click();
    await expect(page.getByRole('dialog', { name: 'Como está esta meta?' })).toBeVisible();
    await page.getByRole('button', { name: 'No ritmo' }).click();
    await page.getByRole('button', { name: 'Salvar check-in' }).click();

    // 10. Verificar o histórico.
    await expect(page.getByRole('main').getByText('Check-in registrado.')).toBeVisible();
  });
});

test.describe('Metas — meta manual numérica', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('cria uma meta manual, atualiza o progresso duas vezes e mantém o histórico', async ({
    page,
  }) => {
    // 1. Criar meta.
    await page.goto('/app/metas/nova');
    await page.getByLabel('Título').fill('Estudar 100 horas (E2E)');
    await goThroughStep(page);
    await goThroughStep(page); // área padrão

    // 2. Tipo numérico (padrão).
    await goThroughStep(page);

    // 3. Alvo 100.
    await page.getByLabel('Alvo', { exact: true }).fill('100');
    await goThroughStep(page);
    await goThroughStep(page); // prazo
    await goThroughStep(page); // acompanhamento manual (padrão)
    await submitGoalForm(page);

    await expect(page.getByRole('heading', { name: 'Estudar 100 horas (E2E)' })).toBeVisible();

    // 4. Atualizar para 25.
    await page.getByRole('button', { name: 'Atualizar progresso' }).click();
    const valueField = page.getByLabel('Novo valor (unidades)');
    await valueField.fill('25');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // 5. Verificar 25%.
    await expect(page.getByText('Progresso: 25 de 100 unidades, 25%.')).toBeVisible();

    // 6. Atualizar para 50.
    await page.getByRole('button', { name: 'Atualizar progresso' }).click();
    await page.getByLabel('Novo valor (unidades)').fill('50');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // 7. Verificar histórico — ambos os registros de progresso aparecem.
    await expect(page.getByText('Progresso: 50 de 100 unidades, 50%.')).toBeVisible();
    await expect(page.getByText('Progresso atualizado para 25.')).toBeVisible();
    await expect(page.getByText('Progresso atualizado para 50.')).toBeVisible();
  });
});

test.describe('Metas — meta por etapas (milestones)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('cria uma meta com 4 marcos, conclui todos e conclui a meta', async ({ page }) => {
    // 1. Criar meta por etapas.
    await page.goto('/app/metas/nova');
    await page.getByLabel('Título').fill('Lançar meu projeto pessoal (E2E)');
    await goThroughStep(page);
    await goThroughStep(page); // área padrão

    await page.getByRole('radio', { name: 'Etapas' }).click();
    await goThroughStep(page);

    // 2. Adicionar 4 marcos.
    for (const title of ['Planejar', 'Construir', 'Testar', 'Publicar']) {
      await page.getByLabel('Novo marco').fill(title);
      await page.getByRole('button', { name: 'Adicionar' }).click();
    }
    await goThroughStep(page);
    await goThroughStep(page); // prazo
    await goThroughStep(page); // acompanhamento manual
    await submitGoalForm(page);

    await expect(
      page.getByRole('heading', { name: 'Lançar meu projeto pessoal (E2E)' }),
    ).toBeVisible();

    // 3. Concluir 2 marcos e verificar progresso.
    await page.getByRole('checkbox', { name: /Planejar/ }).click();
    await page.getByRole('checkbox', { name: /Construir/ }).click();
    await expect(page.getByText('2 de 4 marcos concluídos (50%).')).toBeVisible();

    // 4. Concluir os marcos restantes.
    await page.getByRole('checkbox', { name: /Testar/ }).click();
    await page.getByRole('checkbox', { name: /Publicar/ }).click();
    await expect(page.getByText('4 de 4 marcos concluídos (100%).')).toBeVisible();

    // 5. Concluir a meta.
    await page.getByRole('button', { name: 'Mais ações' }).click();
    await page.getByRole('menuitem', { name: 'Concluir' }).click();
    await expect(page.getByRole('dialog', { name: 'Meta concluída' })).toBeVisible();
    await page.getByRole('button', { name: 'Concluir sem reflexão' }).click();
    await expect(page.getByText('Concluída', { exact: true })).toBeVisible();
  });
});

test.describe('Metas — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function expectNoHorizontalOverflow(page: Page) {
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  }

  test('visão geral, criação, detalhe, atualização, check-in e filtros funcionam sem overflow horizontal', async ({
    page,
  }) => {
    await page.goto('/app/metas');
    await expect(page.getByRole('heading', { name: 'Metas' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'Em andamento' }).click();
    await expect(page.getByRole('heading', { name: 'Em andamento' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: 'Foco' }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Foco' }).click();

    await page.goto('/app/metas/nova');
    await expect(page.getByRole('heading', { name: 'Nova meta' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.getByLabel('Título').fill('Meta criada no mobile (E2E)');
    await goThroughStep(page);
    await goThroughStep(page);
    await goThroughStep(page);
    await page.getByLabel('Alvo', { exact: true }).fill('10');
    await goThroughStep(page);
    await goThroughStep(page);
    await goThroughStep(page);
    await submitGoalForm(page);

    await expect(page.getByRole('heading', { name: 'Meta criada no mobile (E2E)' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: 'Atualizar progresso' }).click();
    await page.getByLabel('Novo valor (unidades)').fill('5');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: 'Fazer check-in' }).click();
    await page.getByRole('button', { name: 'No ritmo' }).click();
    await page.getByRole('button', { name: 'Salvar check-in' }).click();
    await expectNoHorizontalOverflow(page);
  });
});
