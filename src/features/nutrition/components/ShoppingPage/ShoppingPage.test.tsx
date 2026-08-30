import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetNutritionDb } from '../../services/nutritionMockDb';
import { ShoppingPage } from './ShoppingPage';

describe('ShoppingPage', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('shows the header and groups pending items by category', async () => {
    render(<ShoppingPage />);
    expect(screen.getByRole('heading', { name: 'Compras', level: 1 })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Peito de frango')).toBeInTheDocument());
    expect(screen.getByText('Guardanapo')).toBeInTheDocument();
    expect(screen.getByText('Comprados')).toBeInTheDocument();
  });

  it('checks a pending item as purchased', async () => {
    const user = userEvent.setup();
    render(<ShoppingPage />);
    await waitFor(() => expect(screen.getByText('Peito de frango')).toBeInTheDocument());

    const checkbox = screen.getByRole('checkbox', { name: 'Marcar Peito de frango como comprado' });
    await user.click(checkbox);

    await waitFor(() =>
      expect(
        screen.getByRole('checkbox', { name: 'Desmarcar Peito de frango como comprado' }),
      ).toBeChecked(),
    );
  });

  it('adds a manual item', async () => {
    const user = userEvent.setup();
    render(<ShoppingPage />);
    await waitFor(() => expect(screen.getByText('Peito de frango')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Adicionar item' }));
    const dialog = await screen.findByRole('dialog', { name: 'Adicionar item' });
    await user.type(within(dialog).getByLabelText('Item', { exact: true }), 'Papel alumínio');
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }));

    await waitFor(() =>
      expect(screen.getByText('Item adicionado à lista de compras.')).toBeInTheDocument(),
    );
    expect(screen.getByText('Papel alumínio')).toBeInTheDocument();
  });

  it('guards bulk "Guardar itens comprados" behind a confirmed storage location', async () => {
    const user = userEvent.setup();
    render(<ShoppingPage />);
    await waitFor(() => expect(screen.getByText('Comprados')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Guardar itens comprados' }));
    const dialog = await screen.findByRole('dialog', { name: 'Guardar na despensa' });
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() =>
      expect(screen.getByText('Itens guardados na despensa.')).toBeInTheDocument(),
    );
  });

  it('clears purchased items after confirming', async () => {
    const user = userEvent.setup();
    render(<ShoppingPage />);
    await waitFor(() => expect(screen.getByText('Comprados')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Limpar comprados' }));
    const confirmDialog = await screen.findByRole('dialog', { name: 'Limpar comprados?' });
    await user.click(within(confirmDialog).getByRole('button', { name: 'Limpar' }));

    await waitFor(() => expect(screen.getByText('Itens comprados removidos.')).toBeInTheDocument());
  });
});
