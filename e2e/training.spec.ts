import { expect, type Page, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
}

test.describe('Treinamento — main flow (criar rotina → planejar → executar → histórico → progresso)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('building a routine, scheduling it for today, running it and seeing it reflected everywhere', async ({
    page,
  }) => {
    const routineName = `Push E2E ${Date.now()}`;

    // 1-2. Acessar Treinamento, criar rotina.
    await page.goto('/app/treinamento');
    await expect(page.getByRole('heading', { name: 'Treinamento' })).toBeVisible();
    await page.getByRole('tab', { name: 'Meus treinos' }).click();
    await page.getByRole('link', { name: 'Novo treino' }).click();
    await expect(page.getByRole('heading', { name: 'Novo treino' })).toBeVisible();

    await page.locator('input[name="name"]').fill(routineName);

    // 3. Adicionar Supino reto.
    await page.getByRole('button', { name: 'Adicionar exercício' }).click();
    await expect(page.getByRole('dialog', { name: 'Adicionar exercício' })).toBeVisible();
    await page.getByLabel('Buscar exercício').fill('Supino reto');
    await page.getByRole('button', { name: /Supino reto/ }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Supino reto', { exact: true })).toBeVisible();

    // 4. Configurar 3 séries de 8-12.
    await page.getByRole('button', { name: 'Adicionar série' }).click();
    await page.getByRole('button', { name: 'Adicionar série' }).click();
    const repsFields = page.getByLabel('Reps', { exact: true });
    await expect(repsFields).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await repsFields.nth(index).fill('8');
      await page.getByLabel('Até').nth(index).fill('12');
    }

    // 5. Adicionar Desenvolvimento militar.
    await page.getByRole('button', { name: 'Adicionar exercício' }).click();
    await page.getByLabel('Buscar exercício').fill('Desenvolvimento militar');
    await page.getByRole('button', { name: /Desenvolvimento militar/ }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Desenvolvimento militar', { exact: true })).toBeVisible();

    // 6. Salvar.
    await page.getByRole('button', { name: 'Criar treino' }).click();
    await expect(page.getByRole('heading', { name: routineName })).toBeVisible();

    // 7. Planejar para hoje via Calendário. O mock já tem "Pull A" planejado para hoje — pula-o
    // primeiro para que a rotina desta sessão seja a única planejada, sem ambiguidade.
    await page.getByRole('tab', { name: 'Calendário' }).click();
    await expect(page.getByRole('heading', { name: 'Calendário' })).toBeVisible();
    await page
      .getByRole('button', { name: /Pull A/ })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Pular' }).click();

    await page.getByRole('button', { name: 'Planejar treino', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Planejar treino' })).toBeVisible();
    await page.getByLabel('Rotina').click();
    await page.getByRole('option', { name: routineName }).click();
    await page.getByRole('button', { name: 'Planejar', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('button', { name: new RegExp(routineName) }).first()).toBeVisible();

    // 8-9. Abrir Hoje e iniciar o treino.
    await page.getByRole('tab', { name: 'Hoje' }).click();
    await expect(page.getByRole('heading', { name: 'Treinamento' })).toBeVisible();
    await expect(page.getByText('Treino de hoje')).toBeVisible();
    await page.getByRole('button', { name: 'Iniciar treino', exact: true }).click();
    await page.waitForURL(/\/app\/treinamento\/sessao\//);

    // 10-11. Preencher e completar séries.
    await expect(page.getByRole('heading', { name: 'Supino reto' })).toBeVisible();
    await page.locator('input[aria-label^="Peso, série"]').first().fill('70');
    await page.locator('input[aria-label^="Repetições, série"]').first().fill('8');
    await page.getByRole('button', { name: 'Concluir série' }).first().click();

    // 12. Utilizar o timer de descanso.
    await expect(page.getByText('Descanso')).toBeVisible();
    await page.getByRole('button', { name: '+15s' }).click();
    await page.getByRole('button', { name: 'Pular descanso' }).click();

    // Avança para o segundo exercício e completa uma série também, para ter volume/PR reais.
    await page.getByRole('button', { name: 'Próximo' }).click();
    await expect(page.getByRole('heading', { name: 'Desenvolvimento militar' })).toBeVisible();
    await page.locator('input[aria-label^="Peso, série"]').first().fill('35');
    await page.locator('input[aria-label^="Repetições, série"]').first().fill('8');
    await page.getByRole('button', { name: 'Concluir série' }).first().click();

    // 13. Finalizar treino.
    await page.getByRole('button', { name: 'Finalizar' }).click();
    await expect(page.getByRole('dialog', { name: 'Como foi o treino?' })).toBeVisible();
    await page.getByRole('button', { name: 'Finalizar treino' }).click();

    // 14. Visualizar resumo.
    await expect(page.getByRole('dialog', { name: 'Treino concluído' })).toBeVisible();
    await expect(page.getByText(routineName)).toBeVisible();
    await page.getByRole('button', { name: 'Concluir' }).click();

    // 15-16. Abrir Histórico e verificar a sessão.
    await page.waitForURL(/\/app\/treinamento\/historico/);
    await expect(page.getByRole('heading', { name: 'Histórico' })).toBeVisible();
    await expect(page.getByText(routineName)).toBeVisible();

    // 17-18. Abrir Progresso e verificar que os dados agregados existem.
    await page.getByRole('tab', { name: 'Progresso' }).click();
    await expect(page.getByRole('heading', { name: 'Progresso' })).toBeVisible();
    await expect(page.getByText('Total de treinos')).toBeVisible();
  });
});

test.describe('Treinamento — calendário', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('planeja um treino e depois reagenda para outra data', async ({ page }) => {
    await page.goto('/app/treinamento/calendario');
    await expect(page.getByRole('heading', { name: 'Calendário' })).toBeVisible();

    await page.getByRole('button', { name: 'Planejar treino', exact: true }).click();
    await page.getByLabel('Rotina').click();
    await page.getByRole('option', { name: 'Push A' }).click();
    await page.getByRole('button', { name: 'Planejar', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Reagendar via o menu de contexto do chip do calendário (um `Chip` clicável, role="button" —
    // nunca o valor selecionado dentro do <select> "Rotina", que usa role="combobox").
    const pushAChip = page.getByRole('button', { name: /Push A/ }).first();
    await expect(pushAChip).toBeVisible();
    await pushAChip.click();
    await page.getByRole('menuitem', { name: 'Reagendar' }).click();
    await expect(page.getByRole('dialog', { name: 'Reagendar treino' })).toBeVisible();
    await page.getByRole('button', { name: 'Mover para outra data' }).click();
    await expect(page.getByRole('dialog', { name: 'Reagendar treino' })).not.toBeVisible();
  });
});

test.describe('Treinamento — programas', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('cria um programa com um bloco e uma semana, depois inicia e verifica o calendário gerado', async ({
    page,
  }) => {
    const programName = `Programa E2E ${Date.now()}`;

    await page.goto('/app/treinamento/programas/novo');
    await expect(page.getByRole('heading', { name: 'Novo programa' })).toBeVisible();

    await page.locator('input[name="name"]').fill(programName);
    await page.getByLabel('Duração (semanas)').fill('2');

    await page.getByRole('button', { name: 'Adicionar bloco' }).click();
    await page.getByRole('button', { name: 'Adicionar semana' }).click();
    // Agenda "Push A" na segunda-feira da primeira semana.
    await page.getByLabel('Seg').click();
    await page.getByRole('option', { name: 'Push A' }).click();

    await page.getByRole('button', { name: 'Criar programa' }).click();
    await expect(page.getByRole('heading', { name: programName })).toBeVisible();

    await page.getByRole('button', { name: 'Iniciar programa' }).click();
    await expect(page.getByText('Ativo')).toBeVisible();
    await expect(page.getByText(/Seg: Push A/)).toBeVisible();
  });
});

test.describe('Treinamento — biblioteca de exercícios', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('busca, filtra por músculo, abre o detalhe e favorita um exercício', async ({ page }) => {
    await page.goto('/app/treinamento/exercicios');
    await expect(page.getByRole('heading', { name: 'Exercícios' })).toBeVisible();

    await page.getByLabel('Buscar exercícios').fill('Supino');
    await expect(page.getByRole('link', { name: /Supino reto/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Agachamento livre/ })).not.toBeVisible();

    await page.getByLabel('Buscar exercícios').fill('');
    await page.getByLabel('Músculo').click();
    await page.getByRole('option', { name: 'Quadríceps' }).click();
    await expect(page.getByRole('link', { name: /Agachamento livre/ })).toBeVisible();

    await page.getByRole('link', { name: /Agachamento livre/ }).click();
    await expect(page.getByRole('heading', { name: 'Agachamento livre' })).toBeVisible();
    await page.getByRole('button', { name: 'Adicionar aos favoritos' }).click();
    await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible();
  });
});

test.describe('Treinamento — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Hoje, Exercícios e Meus treinos ficam usáveis sem overflow horizontal', async ({
    page,
  }) => {
    await page.goto('/app/treinamento');
    await expect(page.getByRole('heading', { name: 'Treinamento' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'Exercícios' }).click();
    await expect(page.getByRole('heading', { name: 'Exercícios' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'Meus treinos' }).click();
    await expect(page.getByRole('heading', { name: 'Meus treinos' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('inicia um treino livre, registra uma série com o teclado numérico e finaliza', async ({
    page,
  }) => {
    await page.goto('/app/treinamento');
    await page.getByRole('button', { name: 'Iniciar treino livre' }).click();
    await page.waitForURL(/\/app\/treinamento\/sessao\//);
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: 'Adicionar exercício' }).click();
    await page.getByLabel('Buscar exercício').fill('Supino reto');
    await page.getByRole('button', { name: /Supino reto/ }).click();

    const weightInput = page.locator('input[aria-label^="Peso, série"]').first();
    await expect(weightInput).toHaveAttribute('inputmode', 'decimal');
    await weightInput.fill('60');
    await page.locator('input[aria-label^="Repetições, série"]').first().fill('10');
    await page.getByRole('button', { name: 'Concluir série' }).first().click();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: 'Finalizar' }).click();
    await page.getByRole('button', { name: 'Pular' }).click();
    await expect(page.getByRole('dialog', { name: 'Treino concluído' })).toBeVisible();
    // Treino livre sem rotina de origem — deve oferecer salvar como rotina, sem obrigar.
    await expect(page.getByRole('button', { name: 'Salvar como rotina' })).toBeVisible();
  });
});
