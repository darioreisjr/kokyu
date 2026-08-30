import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetNutritionDb } from '../../services/nutritionMockDb';
import { PantryPage } from './PantryPage';

describe('PantryPage', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('shows the header and loads pantry items', async () => {
    render(<PantryPage />);
    expect(screen.getByRole('heading', { name: 'Despensa', level: 1 })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Arroz branco')).toBeInTheDocument());
    expect(screen.getByText('Leite')).toBeInTheDocument();
  });

  it('filters to expiring items', async () => {
    const user = userEvent.setup();
    render(<PantryPage />);
    await waitFor(() => expect(screen.getByText('Arroz branco')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Vencendo' }));
    await waitFor(() => expect(screen.queryByText('Arroz branco')).not.toBeInTheDocument());
    expect(screen.getByText('Tomate')).toBeInTheDocument();
  });

  it('searches by ingredient name', async () => {
    const user = userEvent.setup();
    render(<PantryPage />);
    await waitFor(() => expect(screen.getByText('Arroz branco')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Buscar na despensa'), 'queijo');
    await waitFor(() => expect(screen.queryByText('Arroz branco')).not.toBeInTheDocument());
    expect(screen.getByText('Queijo muçarela')).toBeInTheDocument();
  });

  it('opens the add-item dialog and adds a new item', async () => {
    const user = userEvent.setup();
    render(<PantryPage />);
    await waitFor(() => expect(screen.getByText('Arroz branco')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Adicionar item' }));
    const dialog = await screen.findByRole('dialog', { name: 'Adicionar item' });

    await user.type(within(dialog).getByLabelText('Ingrediente'), 'Batata doce');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(screen.getByText('Item adicionado à despensa.')).toBeInTheDocument(),
    );
    expect(screen.getByText('Batata doce')).toBeInTheDocument();
  });

  it('opens the edit dialog for an existing item and saves changes', async () => {
    const user = userEvent.setup();
    render(<PantryPage />);
    await waitFor(() => expect(screen.getByText('Arroz branco')).toBeInTheDocument());

    const row = screen.getByText('Arroz branco').closest('.MuiPaper-root') as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Mais ações' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Editar' }));

    const dialog = await screen.findByRole('dialog', { name: 'Editar item' });
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Item atualizado.')).toBeInTheDocument());
  });

  it('removes an item after confirming', async () => {
    const user = userEvent.setup();
    render(<PantryPage />);
    await waitFor(() => expect(screen.getByText('Arroz branco')).toBeInTheDocument());

    const row = screen.getByText('Arroz branco').closest('.MuiPaper-root') as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Mais ações' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Remover' }));

    const confirmDialog = await screen.findByRole('dialog', { name: 'Remover item?' });
    await user.click(within(confirmDialog).getByRole('button', { name: 'Remover' }));

    await waitFor(() => expect(screen.getByText('Item removido.')).toBeInTheDocument());
  });

  it('marks an item as out via the row menu and sends it to the shopping list', async () => {
    const user = userEvent.setup();
    render(<PantryPage />);
    await waitFor(() => expect(screen.getByText('Arroz branco')).toBeInTheDocument());

    const row = screen.getByText('Arroz branco').closest('.MuiPaper-root') as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Mais ações' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Marcar como acabou' }));

    await waitFor(() =>
      expect(screen.getByText('Item adicionado à lista de compras.')).toBeInTheDocument(),
    );
  });

  it('shows a quick "Adicionar às compras" action for a low-stock item', async () => {
    const user = userEvent.setup();
    render(<PantryPage />);
    await waitFor(() => expect(screen.getByText('Feijão carioca')).toBeInTheDocument());

    const row = screen.getByText('Feijão carioca').closest('.MuiPaper-root') as HTMLElement;
    expect(within(row).getByText('Estoque baixo')).toBeInTheDocument();
    await user.click(within(row).getByRole('button', { name: 'Adicionar às compras' }));

    await waitFor(() =>
      expect(screen.getByText('Item adicionado à lista de compras.')).toBeInTheDocument(),
    );
  });
});
