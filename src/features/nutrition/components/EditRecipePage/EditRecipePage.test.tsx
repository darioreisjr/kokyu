import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { resetNutritionDb } from '../../services/nutritionMockDb';
import { EditRecipePage } from './EditRecipePage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('EditRecipePage', () => {
  beforeEach(() => {
    resetNutritionDb();
    mockPush.mockClear();
  });

  it("preloads the form with the existing recipe's data", async () => {
    render(<EditRecipePage recipeId="pao-com-ovo" />);
    await waitFor(() =>
      expect(screen.getByLabelText('Nome da receita')).toHaveValue('Pão com ovo e café'),
    );
    expect(screen.getByRole('heading', { name: 'Editar receita', level: 1 })).toBeInTheDocument();
  });

  it('shows a "not found" message for an unknown recipe', async () => {
    render(<EditRecipePage recipeId="does-not-exist" />);
    await waitFor(() => expect(screen.getByText('Receita não encontrada.')).toBeInTheDocument());
  });

  it('saves changes and navigates back to the detail page', async () => {
    const user = userEvent.setup();
    render(<EditRecipePage recipeId="pao-com-ovo" />);
    await waitFor(() =>
      expect(screen.getByLabelText('Nome da receita')).toHaveValue('Pão com ovo e café'),
    );

    await user.clear(screen.getByLabelText('Nome da receita'));
    await user.type(screen.getByLabelText('Nome da receita'), 'Pão com ovo, café e suco');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(screen.getByText('Receita atualizada.')).toBeInTheDocument());
    expect(mockPush).toHaveBeenCalledWith('/app/nutricao/receitas/pao-com-ovo');
  });
});
