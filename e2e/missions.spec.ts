import { expect, test } from '@playwright/test';

test.describe('Missões — fluxo principal', () => {
  test('captura, processa a Inbox, planeja e conclui uma missão', async ({ page }) => {
    // 1. Acessar Missões (Hoje).
    await page.goto('/app/missoes');
    await expect(page.getByRole('heading', { name: 'Hoje', level: 1 })).toBeVisible();

    // 2. Criar via Quick Add (Inbox) — navega pela aba, não por goto(), para preservar o mock DB em memória entre as etapas.
    await page.getByRole('tab', { name: 'Inbox' }).click();
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
    const quickAdd = page.getByRole('textbox', { name: 'Nova missão' }).or(page.getByPlaceholder('Capturar algo novo…'));
    await quickAdd.fill('Comprar material de escritório (E2E)');
    await quickAdd.press('Enter');

    const newRow = page.getByText('Comprar material de escritório (E2E)');
    await expect(newRow).toBeVisible();

    // 3. Processar a missão: mover para "Fazer hoje".
    const row = page.locator('[data-testid^="inbox-item-"]', { hasText: 'Comprar material de escritório (E2E)' });
    await row.getByRole('button', { name: 'Fazer hoje' }).click();
    await expect(newRow).not.toBeVisible();

    // 4. Verificar que ela aparece em Hoje.
    await page.getByRole('tab', { name: 'Hoje' }).click();
    await expect(page.getByText('Comprar material de escritório (E2E)')).toBeVisible();

    // 5. Concluir a missão diretamente pela lista — ela sai das seções abertas e vai para
    // "Concluídas" (colapsada por padrão), então a verificação é feita depois de expandir.
    await page.getByRole('checkbox', { name: /Comprar material de escritório \(E2E\)/ }).click();
    await page.getByRole('button', { name: /Concluídas/ }).click();
    await expect(page.getByRole('checkbox', { name: /Comprar material de escritório \(E2E\)/ })).toBeChecked();
  });
});

test.describe('Missões — dependências', () => {
  test('uma missão bloqueada é liberada quando o bloqueador é concluído', async ({ page }) => {
    await page.goto('/app/missoes/backlog');
    await expect(page.getByRole('heading', { name: 'Backlog' })).toBeVisible();
    // "Configurar domínio" (seed data) está bloqueada por "Finalizar autenticação".
    await expect(page.getByText(/Bloqueada por/)).toBeVisible();
  });
});

test.describe('Missões — aguardando', () => {
  test('lista missões aguardando retorno', async ({ page }) => {
    await page.goto('/app/missoes/aguardando');
    await expect(page.getByRole('heading', { name: 'Aguardando' })).toBeVisible();
    await expect(page.getByText(/Aguardando retorno do fornecedor/)).toBeVisible();
  });
});

test.describe('Missões — revisão', () => {
  test('a revisão guiada mostra Inbox, Atrasadas, Aguardando e Bloqueadas', async ({ page }) => {
    await page.goto('/app/missoes/revisao');
    await expect(page.getByRole('heading', { name: 'Revisão' })).toBeVisible();
    await expect(page.getByText(/Inbox \(/)).toBeVisible();
    await expect(page.getByText(/Atrasadas \(/)).toBeVisible();
    await expect(page.getByText(/Aguardando \(/)).toBeVisible();
    await expect(page.getByText(/Bloqueadas \(/)).toBeVisible();
  });
});

test.describe('Missões — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Hoje, Inbox e detalhes renderizam sem overflow horizontal', async ({ page }) => {
    for (const path of ['/app/missoes', '/app/missoes/inbox', '/app/missoes/backlog']) {
      await page.goto(path);
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(hasOverflow, `overflow horizontal em ${path}`).toBe(false);
    }
  });
});
