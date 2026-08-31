import { expect, test } from '@playwright/test';

test.describe('Ritmo Diário Module', () => {
  test('navigates through Ritmo Diário views, opens planning, and manages entries', async ({ page }) => {
    // 1. Visit main Ritmo Diário page
    await page.goto('/app/ritmo-diario');
    await expect(page.getByRole('heading', { name: 'Ritmo Diário' })).toBeVisible();

    // 2. Check tab navigation
    const tabs = page.getByRole('tablist', { name: 'Seções do Ritmo Diário' });
    await expect(tabs).toBeVisible();
    await expect(tabs.getByRole('tab', { name: 'Hoje' })).toBeVisible();
    await expect(tabs.getByRole('tab', { name: 'Semana' })).toBeVisible();
    await expect(tabs.getByRole('tab', { name: 'Calendário' })).toBeVisible();
    await expect(tabs.getByRole('tab', { name: 'Caixa de entrada' })).toBeVisible();
    await expect(tabs.getByRole('tab', { name: 'Rotinas' })).toBeVisible();
    await expect(tabs.getByRole('tab', { name: 'Foco' })).toBeVisible();
    await expect(tabs.getByRole('tab', { name: 'Revisão' })).toBeVisible();

    // 3. Open "Planejar meu dia" dialog
    await page.getByRole('button', { name: 'Planejar meu dia' }).click();
    const planningDialog = page.getByRole('dialog');
    await expect(planningDialog).toBeVisible();
    await expect(planningDialog.getByText('Definir Prioridades')).toBeVisible();

    // Close dialog
    await planningDialog.getByRole('button', { name: 'Fechar' }).click();

    // 4. Create a new manual entry
    await page.getByRole('button', { name: 'Adicionar' }).click();
    const entryDialog = page.getByRole('dialog');
    await expect(entryDialog).toBeVisible();

    await entryDialog.getByLabel('Título').fill('Reunião de Alinhamento');
    await entryDialog.getByRole('button', { name: 'Salvar' }).click();

    // Verify it appeared in the timeline
    await expect(page.getByText('Reunião de Alinhamento').first()).toBeVisible();

    // 5. Navigate to "Caixa de entrada"
    await tabs.getByRole('tab', { name: 'Caixa de entrada' }).click();
    await expect(page).toHaveURL(/\/app\/ritmo-diario\/inbox/);
    await expect(page.getByRole('heading', { name: 'Caixa de Entrada' })).toBeVisible();

    // Capture quick thought
    await page.getByLabel('Título da captura rápida').fill('Comprar café especial');
    await page.getByRole('button', { name: 'Capturar' }).click();
    await expect(page.getByText('Comprar café especial').first()).toBeVisible();

    // 6. Navigate to "Modo de Foco"
    await tabs.getByRole('tab', { name: 'Foco' }).click();
    await expect(page).toHaveURL(/\/app\/ritmo-diario\/foco/);
    await expect(page.getByRole('heading', { name: 'Modo de Foco' })).toBeVisible();

    // Start a focus session
    await page.getByLabel('No que você vai focar agora?').fill('Refatoração do Scheduler');
    await page.getByRole('button', { name: 'Começar Sessão de Foco' }).click();

    // Verify active session timer
    await expect(page.getByText('Refatoração do Scheduler')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pausar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Concluir' })).toBeVisible();

    // 7. Navigate to "Semana" and "Calendário"
    await tabs.getByRole('tab', { name: 'Semana' }).click();
    await expect(page).toHaveURL(/\/app\/ritmo-diario\/semana/);

    await tabs.getByRole('tab', { name: 'Calendário' }).click();
    await expect(page).toHaveURL(/\/app\/ritmo-diario\/calendario/);

    // 8. Navigate to "Rotinas" and "Revisão"
    await tabs.getByRole('tab', { name: 'Rotinas' }).click();
    await expect(page).toHaveURL(/\/app\/ritmo-diario\/rotinas/);
    await expect(page.getByRole('heading', { name: 'Rotinas e Modelos de Dia' })).toBeVisible();

    await tabs.getByRole('tab', { name: 'Revisão' }).click();
    await expect(page).toHaveURL(/\/app\/ritmo-diario\/revisao/);
    await expect(page.getByRole('heading', { name: 'Revisão e Fechamento' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Fechamento' })).toBeVisible();
  });
});
