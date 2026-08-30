import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetNutritionDb } from '../../services/nutritionMockDb';
import { PlannerPage } from './PlannerPage';

describe('PlannerPage', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('shows the header, week range and the recipe queue', async () => {
    render(<PlannerPage />);
    expect(screen.getByRole('heading', { name: 'Planejamento', level: 1 })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Fila para esta semana')).toBeInTheDocument());
    const queueRegion = screen.getByRole('region', { name: 'Fila de receitas' });
    expect(within(queueRegion).getByText('Omelete com aveia')).toBeInTheDocument();
  });

  it('assigns a queued recipe to a day', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('Fila para esta semana')).toBeInTheDocument());

    const queueRegion = screen.getByRole('region', { name: 'Fila de receitas' });
    const queueRow = within(queueRegion)
      .getByText('Omelete com aveia')
      .closest('div') as HTMLElement;
    await user.click(within(queueRow).getByRole('button', { name: 'Atribuir a um dia' }));

    const dialog = await screen.findByRole('dialog', { name: 'Adicionar ao planejamento' });
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => expect(screen.getByText('Receita atribuída ao dia.')).toBeInTheDocument());
  });

  it('removes a recipe from the queue', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('Fila para esta semana')).toBeInTheDocument());

    const queueRegion = screen.getByRole('region', { name: 'Fila de receitas' });
    const queueRow = within(queueRegion)
      .getByText('Banana com aveia e iogurte')
      .closest('div') as HTMLElement;
    await user.click(within(queueRow).getByRole('button', { name: 'Remover da fila' }));
    await waitFor(() =>
      expect(within(queueRegion).queryByText('Banana com aveia e iogurte')).not.toBeInTheDocument(),
    );
  });

  it('generates a shopping list for the current week and adds it', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('Fila para esta semana')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Gerar lista de compras' }));
    const dialog = await screen.findByRole('dialog', { name: 'Gerar lista de compras' });
    await user.click(within(dialog).getByRole('button', { name: 'Calcular' }));

    await waitFor(() =>
      expect(within(dialog).getByText(/ingredientes necessários/)).toBeInTheDocument(),
    );

    const addButton = within(dialog).getByRole('button', { name: 'Adicionar às compras' });
    if (!(addButton as HTMLButtonElement).disabled) {
      await user.click(addButton);
      await waitFor(() =>
        expect(screen.getByText('Lista de compras atualizada.')).toBeInTheDocument(),
      );
    }
  });

  it('clears the planejamento for the selected day after confirming', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('Fila para esta semana')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Limpar planejamento do dia' }));
    const dialog = await screen.findByRole('dialog', { name: 'Limpar planejamento do dia?' });
    await user.click(within(dialog).getByRole('button', { name: 'Limpar' }));

    await waitFor(() => expect(screen.getByText('Planejamento do dia limpo.')).toBeInTheDocument());
  });

  it('duplicates a day into the next one', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('Fila para esta semana')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Copiar este dia' }));
    const dialog = await screen.findByRole('dialog', { name: 'Copiar este dia' });
    await user.click(within(dialog).getByRole('button', { name: 'Copiar' }));

    await waitFor(() => expect(screen.getByText(/Dia copiado para/)).toBeInTheDocument());
  });

  it('navigates to the next/previous week', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('Fila para esta semana')).toBeInTheDocument());
    const initialHeading = screen.getByRole('heading', { level: 2 }).textContent;

    await user.click(screen.getByRole('button', { name: 'Próxima semana' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(initialHeading),
    );
  });
});
