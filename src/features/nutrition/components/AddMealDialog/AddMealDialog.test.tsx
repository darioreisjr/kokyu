import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { mockIngredients } from '../../mocks/ingredients.mock';
import { mockRecipes } from '../../mocks/recipes.mock';
import { resetNutritionDb } from '../../services/nutritionMockDb';
import type { MealType } from '../../types/mealPlan.types';
import { AddMealDialog } from './AddMealDialog';

const mealType: MealType = {
  id: 'almoco',
  name: 'Almoço',
  order: 2,
  defaultTime: '12:30',
  enabled: true,
};

describe('AddMealDialog', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('adds a recipe with chosen servings and time', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(
      <AddMealDialog
        open
        date="2030-01-15"
        mealType={mealType}
        recipes={mockRecipes}
        ingredients={mockIngredients}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Adicionar receita' }));
    await user.type(screen.getByLabelText('Buscar receitas'), 'Omelete');
    await user.click(screen.getByText('Omelete com aveia'));

    const servingsField = screen.getByLabelText('Porções');
    await user.clear(servingsField);
    await user.type(servingsField, '3');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(screen.getByText('Refeição adicionada ao planejamento.')).toBeInTheDocument();
  });

  it('filters the recipe picker to favorites only', async () => {
    const user = userEvent.setup();
    render(
      <AddMealDialog
        open
        date="2030-01-15"
        mealType={mealType}
        recipes={mockRecipes}
        ingredients={mockIngredients}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Adicionar receita' }));
    expect(screen.getByText('Omelete com aveia')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Favoritas' }));
    expect(screen.queryByText('Omelete com aveia')).not.toBeInTheDocument();
    expect(screen.getByText('Frango grelhado com arroz e feijão')).toBeInTheDocument();
  });

  it('adds a free-standing food item, creating a new ingredient on save', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(
      <AddMealDialog
        open
        date="2030-01-15"
        mealType={mealType}
        recipes={mockRecipes}
        ingredients={mockIngredients}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Adicionar alimento' }));
    await user.type(screen.getByLabelText('Ingrediente'), 'Melancia');
    const quantityField = screen.getByLabelText('Quantidade', { exact: true });
    await user.clear(quantityField);
    await user.type(quantityField, '2');

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('adds a second food row and can remove one', async () => {
    const user = userEvent.setup();
    render(
      <AddMealDialog
        open
        date="2030-01-15"
        mealType={mealType}
        recipes={mockRecipes}
        ingredients={mockIngredients}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Adicionar alimento' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar outro item' }));
    expect(screen.getAllByRole('button', { name: 'Remover item' })).toHaveLength(2);

    await user.click(screen.getAllByRole('button', { name: 'Remover item' })[1]!);
    expect(screen.getAllByRole('button', { name: 'Remover item' })).toHaveLength(1);
  });

  it('adds a note using a suggestion', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(
      <AddMealDialog
        open
        date="2030-01-15"
        mealType={mealType}
        recipes={mockRecipes}
        ingredients={mockIngredients}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Adicionar anotação' }));
    await user.click(screen.getByRole('button', { name: 'Sobras de ontem' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('shows an error when repeating with no previous meal of that type', async () => {
    const user = userEvent.setup();
    render(
      <AddMealDialog
        open
        date="2000-01-01"
        mealType={mealType}
        recipes={mockRecipes}
        ingredients={mockIngredients}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Repetir refeição anterior' }));
    await waitFor(() =>
      expect(
        screen.getByText('Nenhuma refeição anterior encontrada para repetir.'),
      ).toBeInTheDocument(),
    );
  });

  it('can navigate back from a step to the choose menu', async () => {
    const user = userEvent.setup();
    render(
      <AddMealDialog
        open
        date="2030-01-15"
        mealType={mealType}
        recipes={mockRecipes}
        ingredients={mockIngredients}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Adicionar anotação' }));
    const backButtons = screen.getAllByRole('button', { name: 'Voltar' });
    await user.click(backButtons[0]!);
    expect(screen.getByRole('button', { name: 'Adicionar receita' })).toBeInTheDocument();
  });

  it('closes via Cancelar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <AddMealDialog
        open
        date="2030-01-15"
        mealType={mealType}
        recipes={mockRecipes}
        ingredients={mockIngredients}
        onClose={onClose}
        onSaved={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
