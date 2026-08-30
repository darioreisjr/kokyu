import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { resetNutritionDb } from '../../services/nutritionMockDb';
import { NewRecipePage } from './NewRecipePage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('NewRecipePage', () => {
  beforeEach(() => {
    resetNutritionDb();
    mockPush.mockClear();
  });

  it('shows the header and the empty form', () => {
    render(<NewRecipePage />);
    expect(screen.getByRole('heading', { name: 'Nova receita', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da receita')).toHaveValue('');
  });

  it('creates a recipe with a new ingredient and a step, then navigates to its detail page', async () => {
    const user = userEvent.setup();
    render(<NewRecipePage />);

    await user.type(screen.getByLabelText('Nome da receita'), 'Salada de tomate');
    await user.clear(screen.getByLabelText('Porções'));
    await user.type(screen.getByLabelText('Porções'), '2');

    await user.click(screen.getByRole('button', { name: 'Adicionar ingrediente' }));
    await user.type(screen.getByRole('combobox', { name: 'Ingrediente' }), 'Tomate cereja');
    await user.clear(screen.getByLabelText('Quantidade', { exact: true }));
    await user.type(screen.getByLabelText('Quantidade', { exact: true }), '10');

    await user.click(screen.getByRole('button', { name: 'Adicionar etapa' }));
    await user.type(screen.getByLabelText('Etapa 1'), 'Corte os tomates ao meio.');

    await user.click(screen.getByRole('button', { name: 'Salvar receita' }));

    await waitFor(() => expect(screen.getByText('Receita salva.')).toBeInTheDocument());
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    expect(mockPush.mock.calls[0]![0] as string).toMatch(/^\/app\/nutricao\/receitas\//);
  });

  it('shows validation errors when saving an empty form', async () => {
    const user = userEvent.setup();
    render(<NewRecipePage />);

    await user.click(screen.getByRole('button', { name: 'Salvar receita' }));

    await waitFor(() => expect(screen.getByText('Informe o nome da receita')).toBeInTheDocument());
    expect(mockPush).not.toHaveBeenCalled();
  });
});
