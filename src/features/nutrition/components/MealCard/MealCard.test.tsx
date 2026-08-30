import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { MealType, PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { MealCard } from './MealCard';

const mealType: MealType = {
  id: 'almoco',
  name: 'Almoço',
  order: 2,
  defaultTime: '12:30',
  enabled: true,
};

describe('MealCard', () => {
  it('shows the empty state with an "Adicionar refeição" CTA when nothing is planned', () => {
    const onAddMeal = vi.fn();
    render(<MealCard mealType={mealType} onAddMeal={onAddMeal} />);

    expect(screen.getByText('Nenhuma refeição planejada')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Adicionar refeição' }).click();
    expect(onAddMeal).toHaveBeenCalled();
  });

  it('shows the recipe name and servings when planned with a recipe', () => {
    const meal: PlannedMeal = {
      id: 'meal-1',
      date: '2026-08-29',
      mealTypeId: 'almoco',
      contentType: 'recipe',
      recipeId: 'recipe-1',
      servings: 4,
      prepared: false,
      createdAt: '2026-08-29T00:00:00.000Z',
    };
    const recipe: Recipe = {
      id: 'recipe-1',
      name: 'Frango grelhado',
      category: 'almoco',
      tags: [],
      preparationTime: 10,
      cookingTime: 20,
      servings: 4,
      ingredients: [],
      steps: [],
      favorite: false,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    };

    render(<MealCard mealType={mealType} meal={meal} recipe={recipe} onAddMeal={vi.fn()} />);

    expect(screen.getByText('Frango grelhado')).toBeInTheDocument();
    expect(screen.getByText('4 porções')).toBeInTheDocument();
  });

  it('shows a note when planned as a note', () => {
    const meal: PlannedMeal = {
      id: 'meal-2',
      date: '2026-08-29',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'Almoçar fora',
      prepared: false,
      createdAt: '2026-08-29T00:00:00.000Z',
    };

    render(<MealCard mealType={mealType} meal={meal} onAddMeal={vi.fn()} />);

    expect(screen.getByText('Almoçar fora')).toBeInTheDocument();
  });

  it('toggles the prepared indicator', () => {
    const meal: PlannedMeal = {
      id: 'meal-3',
      date: '2026-08-29',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'Livre',
      prepared: false,
      createdAt: '2026-08-29T00:00:00.000Z',
    };
    const onTogglePrepared = vi.fn();

    render(
      <MealCard
        mealType={mealType}
        meal={meal}
        onAddMeal={vi.fn()}
        onTogglePrepared={onTogglePrepared}
      />,
    );

    screen.getByRole('button', { name: 'Marcar como preparada' }).click();
    expect(onTogglePrepared).toHaveBeenCalledWith(meal);
  });
});
