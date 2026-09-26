import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { mockIngredients } from '../../mocks/ingredients.mock';
import { RecipeForm } from './RecipeForm';

describe('RecipeForm tags', () => {
  it('keeps a tag typed without Enter when leaving the field, lower-cased', async () => {
    const user = userEvent.setup();
    render(<RecipeForm ingredients={mockIngredients} submitLabel="Salvar" onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText('Tags (opcional)'), 'Marmita Fit');
    await user.click(document.body);

    expect(screen.getByRole('button', { name: 'marmita fit' })).toBeInTheDocument();
  });

  it('suggests tags already used in other recipes', async () => {
    const user = userEvent.setup();
    render(<RecipeForm ingredients={mockIngredients} submitLabel="Salvar" onSubmit={vi.fn()} />);

    await user.click(screen.getByLabelText('Tags (opcional)'));

    expect(await screen.findByRole('option', { name: 'vegetariano' })).toBeInTheDocument();
  });
});
